import type { CampaignEligibleCharacter } from '@rpg/contracts'
import type { ComboboxFieldOption } from '@rpg/ui'

import { formatComboboxBlockingDescription } from './campaign-character-eligibility-display'

export const ONBOARDING_CHOICE_EXISTING = 'existing'
export const ONBOARDING_CHOICE_NEW = 'new'

export type OnboardingBranch = 'choice' | 'existing' | 'new'

export function buildCharacterOptions(
  characters: CampaignEligibleCharacter[],
): ComboboxFieldOption[] {
  return characters.map((entry) => ({
    value: entry.characterId,
    label: entry.name,
    description: entry.eligibility.eligible
      ? entry.summary
      : formatComboboxBlockingDescription(entry.eligibility.blockingIssues),
    disabled: !entry.eligibility.eligible,
  }))
}

export function summarizeEligibleCharacters(characters: CampaignEligibleCharacter[] | undefined) {
  const list = characters ?? []
  return {
    hasCharacters: list.length > 0,
    hasEligibleCharacter: list.some((entry) => entry.eligibility.eligible),
  }
}
