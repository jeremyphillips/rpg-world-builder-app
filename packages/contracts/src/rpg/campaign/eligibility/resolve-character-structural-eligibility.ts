import type { Character } from '../../runtime/character/sheet'
import { pcCharacterSchema } from '../../runtime/character/sheet'
import type { CharacterCampaignBlockingIssue } from './character-campaign-eligibility'

export type ResolveCharacterStructuralEligibilityInput = {
  character: Character
}

export type ResolveCharacterStructuralEligibilityResult = {
  blockingIssues: CharacterCampaignBlockingIssue[]
}

export function resolveCharacterStructuralEligibility({
  character,
}: ResolveCharacterStructuralEligibilityInput): ResolveCharacterStructuralEligibilityResult {
  const parsed = pcCharacterSchema.safeParse(character)

  if (!parsed.success) {
    return { blockingIssues: [{ code: 'structurally_invalid' }] }
  }

  return { blockingIssues: [] }
}
