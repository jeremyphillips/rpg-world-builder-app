import type {
  CompleteCampaignCharacterAssignmentResult,
  CreateCharacterInput,
} from '@rpg/contracts'

import {
  assertExistingCharacterEligible,
  assertNewCharacterBuildEligible,
  resolveExistingCharacterCandidate,
  resolveNewCharacterCandidate,
} from './resolve-campaign-character-candidates.lib'
import type { CampaignCharacterCompletionInvitePolicy } from './execute-campaign-character-completion.lib'
import {
  executeExistingCharacterCompletion,
  executeNewCharacterCompletion,
} from './execute-campaign-character-completion.lib'
import { resolveCampaignCharacterEligibilityContext } from './resolve-campaign-character-eligibility-context.lib'

export type CampaignCharacterAssignmentCharacterSource =
  | { kind: 'new'; characterInput: CreateCharacterInput }
  | { kind: 'existing'; characterId: string }

export async function completeCampaignCharacterAssignment({
  userId,
  campaignId,
  membershipId,
  characterSource,
  invitePolicy,
}: {
  userId: string
  campaignId: string
  membershipId: string
  characterSource: CampaignCharacterAssignmentCharacterSource
  invitePolicy: CampaignCharacterCompletionInvitePolicy
}): Promise<CompleteCampaignCharacterAssignmentResult> {
  const candidate =
    characterSource.kind === 'new'
      ? await resolveNewCharacterCandidate({
          campaignId,
          userId,
          characterCreateInput: characterSource.characterInput,
        })
      : await resolveExistingCharacterCandidate({
          userId,
          characterId: characterSource.characterId,
        })

  const eligibilityContext = await resolveCampaignCharacterEligibilityContext(campaignId)

  if (candidate.kind === 'new') {
    await assertNewCharacterBuildEligible({
      campaignId,
      userId,
      candidate,
      eligibilityContext,
    })

    return executeNewCharacterCompletion({
      campaignId,
      membershipId,
      userId,
      parsedInput: candidate.parsedInput,
      invitePolicy,
    })
  }

  await assertExistingCharacterEligible({
    campaignId,
    userId,
    candidate,
    eligibilityContext,
  })

  await executeExistingCharacterCompletion({
    campaignId,
    membershipId,
    characterId: candidate.character.id,
    invitePolicy,
  })

  return { campaignId, characterId: candidate.character.id }
}
