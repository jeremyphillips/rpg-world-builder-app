import type { CharacterEligibilitySubject } from './character-eligibility-subject'
import type { CharacterCampaignBlockingIssue } from '../../campaign/character/eligibility-contracts'

export type ResolveCharacterParticipationEligibilityInput = {
  subject: CharacterEligibilitySubject
  userId: string
  campaignId: string
  existingOpenParticipation?: Pick<{ campaignId: string }, 'campaignId'> | null
  conflictingCampaignName?: string
}

export type ResolveCharacterParticipationEligibilityResult = {
  blockingIssues: CharacterCampaignBlockingIssue[]
}

export function resolveCharacterParticipationEligibility({
  subject,
  userId,
  campaignId,
  existingOpenParticipation,
  conflictingCampaignName,
}: ResolveCharacterParticipationEligibilityInput): ResolveCharacterParticipationEligibilityResult {
  const blockingIssues: CharacterCampaignBlockingIssue[] = []

  if (subject.characterType !== 'pc' || subject.userId !== userId) {
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
