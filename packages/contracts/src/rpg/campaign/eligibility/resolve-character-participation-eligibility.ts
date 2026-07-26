import type { CampaignCharacterParticipation } from '../campaign-character-participation'
import type { Character } from '../../runtime/character/sheet'
import type { CharacterCampaignBlockingIssue } from './character-campaign-eligibility'

export type ResolveCharacterParticipationEligibilityInput = {
  character: Character
  userId: string
  campaignId: string
  existingOpenParticipation?: Pick<CampaignCharacterParticipation, 'campaignId'> | null
  conflictingCampaignName?: string
}

export type ResolveCharacterParticipationEligibilityResult = {
  blockingIssues: CharacterCampaignBlockingIssue[]
}

export function resolveCharacterParticipationEligibility({
  character,
  userId,
  campaignId,
  existingOpenParticipation,
  conflictingCampaignName,
}: ResolveCharacterParticipationEligibilityInput): ResolveCharacterParticipationEligibilityResult {
  const blockingIssues: CharacterCampaignBlockingIssue[] = []

  if (character.characterType !== 'pc' || character.userId !== userId) {
    blockingIssues.push({ code: 'not_owned_pc' })
    return { blockingIssues }
  }

  if (existingOpenParticipation && existingOpenParticipation.campaignId !== campaignId) {
    blockingIssues.push({
      code: 'conflicting_open_participation',
      ...(conflictingCampaignName ? { conflictingCampaignName } : {}),
    })
  }

  return { blockingIssues }
}
