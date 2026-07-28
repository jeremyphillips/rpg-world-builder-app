import type { CompleteCampaignCharacterAssignmentResult } from '@rpg/contracts'

import {
  executeExistingCharacterCompletion,
  executeNewCharacterCompletion,
} from './execute-campaign-character-completion.lib'

export async function executeExistingCharacterInviteCompletion({
  inviteId,
  campaignId,
  membershipId,
  characterId,
}: {
  inviteId: string
  campaignId: string
  membershipId: string
  characterId: string
}) {
  return executeExistingCharacterCompletion({
    campaignId,
    membershipId,
    characterId,
    invitePolicy: { kind: 'invite', inviteId },
  })
}

export async function executeNewCharacterInviteCompletion({
  inviteId,
  campaignId,
  membershipId,
  userId,
  parsedInput,
}: {
  inviteId: string
  campaignId: string
  membershipId: string
  userId: string
  parsedInput: Parameters<typeof executeNewCharacterCompletion>[0]['parsedInput']
}): Promise<CompleteCampaignCharacterAssignmentResult> {
  return executeNewCharacterCompletion({
    campaignId,
    membershipId,
    userId,
    parsedInput,
    invitePolicy: { kind: 'invite', inviteId },
  })
}

// Legacy exports retained for any external callers during transition.
export const completeExistingCharacterInviteWrites = executeExistingCharacterInviteCompletion
export const completeNewCharacterInviteWrites = executeNewCharacterInviteCompletion
