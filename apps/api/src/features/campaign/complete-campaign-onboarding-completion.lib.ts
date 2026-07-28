import type { CompleteCampaignOnboardingResult } from '@rpg/contracts'

import {
  executeExistingCharacterCompletion,
  executeNewCharacterCompletion,
} from '../campaign-invite/execute-campaign-character-completion.lib'

export async function executeExistingCharacterOnboardingCompletion({
  campaignId,
  membershipId,
  characterId,
  linkedInviteId,
}: {
  campaignId: string
  membershipId: string
  characterId: string
  linkedInviteId?: string | null
}) {
  return executeExistingCharacterCompletion({
    campaignId,
    membershipId,
    characterId,
    invitePolicy: { kind: 'onboarding', linkedInviteId },
  })
}

export async function executeNewCharacterOnboardingCompletion({
  campaignId,
  membershipId,
  userId,
  parsedInput,
  linkedInviteId,
}: {
  campaignId: string
  membershipId: string
  userId: string
  parsedInput: Parameters<typeof executeNewCharacterCompletion>[0]['parsedInput']
  linkedInviteId?: string | null
}): Promise<CompleteCampaignOnboardingResult> {
  return executeNewCharacterCompletion({
    campaignId,
    membershipId,
    userId,
    parsedInput,
    invitePolicy: { kind: 'onboarding', linkedInviteId },
  })
}
