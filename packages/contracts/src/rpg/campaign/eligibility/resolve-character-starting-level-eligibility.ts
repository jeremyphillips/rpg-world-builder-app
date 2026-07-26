import { getCharacterTotalLevel, type Character } from '../../runtime/character/sheet'
import type { CharacterCampaignBlockingIssue } from './character-campaign-eligibility'

export type ResolveCharacterStartingLevelEligibilityInput = {
  character: Character
  startingLevel: number
}

export type ResolveCharacterStartingLevelEligibilityResult = {
  blockingIssues: CharacterCampaignBlockingIssue[]
}

export function resolveCharacterStartingLevelEligibility({
  character,
  startingLevel,
}: ResolveCharacterStartingLevelEligibilityInput): ResolveCharacterStartingLevelEligibilityResult {
  const actualLevel = getCharacterTotalLevel(character)

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
