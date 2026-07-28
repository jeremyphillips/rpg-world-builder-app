import type { CampaignInviteEmailsInput, CreateCampaignInviteDeliveryResult } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { findSessionUserById } from '../user'
import { normalizeInviteEmail, sendCampaignInvite } from '../campaign-invite'

function dedupeInviteRecipients(
  inviteEmails: CampaignInviteEmailsInput,
): CampaignInviteEmailsInput {
  const seen = new Set<string>()
  const deduped: CampaignInviteEmailsInput = []

  for (const entry of inviteEmails) {
    const { normalizedEmail } = normalizeInviteEmail(entry.email)
    if (seen.has(normalizedEmail)) continue
    seen.add(normalizedEmail)
    deduped.push({ email: entry.email.trim() })
  }

  return deduped
}

export async function sendInitialCampaignInvites({
  campaignId,
  invitedByUserId,
  inviteEmails,
}: {
  campaignId: string
  invitedByUserId: string
  inviteEmails: CampaignInviteEmailsInput
}): Promise<CreateCampaignInviteDeliveryResult[]> {
  const recipients = await assertValidInitialCampaignInviteRecipients({
    invitedByUserId,
    inviteEmails,
  })

  const results: CreateCampaignInviteDeliveryResult[] = []

  for (const entry of recipients) {
    try {
      const { invite } = await sendCampaignInvite({
        campaignId,
        email: entry.email,
        invitedByUserId,
      })

      results.push({
        email: invite.email,
        inviteId: invite.id,
        deliveryStatus: invite.deliveryStatus === 'sent' ? 'sent' : 'failed',
      })
    } catch {
      results.push({
        email: entry.email.trim(),
        deliveryStatus: 'failed',
      })
    }
  }

  return results
}

export async function assertValidInitialCampaignInviteRecipients({
  invitedByUserId,
  inviteEmails,
}: {
  invitedByUserId: string
  inviteEmails: CampaignInviteEmailsInput
}): Promise<CampaignInviteEmailsInput> {
  const creator = await findSessionUserById(invitedByUserId)
  const creatorEmail = creator?.email ? normalizeInviteEmail(creator.email).normalizedEmail : null
  const recipients = dedupeInviteRecipients(inviteEmails)

  for (const entry of recipients) {
    const { normalizedEmail } = normalizeInviteEmail(entry.email)
    if (creatorEmail && normalizedEmail === creatorEmail) {
      throw HttpError.badRequest('Cannot invite your own email address.')
    }
  }

  return recipients
}
