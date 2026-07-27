import { getCharacterTotalLevel } from '../../runtime/character/sheet'
import type { CharacterEligibilitySubject } from './character-eligibility-subject'
import type { CharacterCampaignBlockingIssue } from './character-campaign-eligibility'

export type ResolveCharacterStartingLevelEligibilityInput = {
  subject: CharacterEligibilitySubject
  startingLevel: number
}

export type ResolveCharacterStartingLevelEligibilityResult = {
  blockingIssues: CharacterCampaignBlockingIssue[]
}

export function resolveCharacterStartingLevelEligibility({
  subject,
  startingLevel,
}: ResolveCharacterStartingLevelEligibilityInput): ResolveCharacterStartingLevelEligibilityResult {
  const actualLevel = getCharacterTotalLevel(subject)

  if (actualLevel !== startingLevel) {
    return {
      blockingIssues: [
        {
          code: 'level_mismatch',
          actualLevel,
          requiredLevel: startingLevel,
        },
      ],
    }
  }

  return { blockingIssues: [] }
}
