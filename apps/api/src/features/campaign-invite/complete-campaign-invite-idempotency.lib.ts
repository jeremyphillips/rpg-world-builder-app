import type { CampaignInvite, CompleteCampaignInviteResult } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'

export async function resolveCompletedInviteForExistingCharacter({
  invite,
  userId,
  characterId,
}: {
  invite: CampaignInvite
  userId: string
  characterId: string
}): Promise<CompleteCampaignInviteResult | null> {
  if (invite.status !== 'completed') return null

  if (invite.acceptedByUserId !== userId) {
    throw new HttpError(403, 'forbidden', 'This invitation belongs to another user.')
  }

  if (invite.completedCharacterId === characterId) {
    return { campaignId: invite.campaignId, characterId }
  }

  throw new HttpError(
    409,
    'conflict',
    'This invitation was already completed with a different character.',
  )
}

export async function resolveCompletedInviteForNewCharacter({
  invite,
  userId,
}: {
  invite: CampaignInvite
  userId: string
}): Promise<CompleteCampaignInviteResult | null> {
  if (invite.status !== 'completed') return null

  if (invite.acceptedByUserId !== userId) {
    throw new HttpError(403, 'forbidden', 'This invitation belongs to another user.')
  }

  if (!invite.completedCharacterId) {
    throw new HttpError(409, 'conflict', 'This invitation was already completed.')
  }

  return { campaignId: invite.campaignId, characterId: invite.completedCharacterId }
}
