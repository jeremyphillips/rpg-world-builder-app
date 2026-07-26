import type { EmailProvider } from '../../services/email/email.types'
import { sendCampaignInviteEmail } from '../../services/email/email.service'
import {
  beginInviteDeliveryAttempt,
  markInviteDeliveryFailed,
  markInviteSent,
} from './campaign-invite.repository'

export type DeliverCampaignInviteEmailInput = {
  inviteId: string
  campaignName: string
  inviterName: string
  recipientEmail: string
  rawToken: string
  provider?: EmailProvider
}

export async function deliverCampaignInviteEmail(
  input: DeliverCampaignInviteEmailInput,
): Promise<'sent' | 'failed'> {
  await beginInviteDeliveryAttempt(input.inviteId)

  const result = await sendCampaignInviteEmail(
    {
      inviteId: input.inviteId,
      campaignName: input.campaignName,
      inviterName: input.inviterName,
      recipientEmail: input.recipientEmail,
      rawToken: input.rawToken,
    },
    input.provider,
  )

  if (result.ok) {
    await markInviteSent(input.inviteId)
    return 'sent'
  }

  await markInviteDeliveryFailed(input.inviteId, result.errorCode)
  return 'failed'
}
