import type {
  CampaignEligibleCharacter,
  CharacterCampaignWarning,
  CharacterCampaignWarningCategory,
} from '@rpg/contracts'
import type { ComboboxFieldOption } from '@rpg/ui'

import { formatComboboxBlockingDescription } from './campaign-invite-eligibility-display'

export const ONBOARDING_CHOICE_EXISTING = 'existing'
export const ONBOARDING_CHOICE_NEW = 'new'

export type OnboardingBranch = 'choice' | 'existing' | 'new'

export const WARNING_CATEGORY_LABELS: Record<CharacterCampaignWarningCategory, string> = {
  equipment: 'Equipment',
  spells: 'Spells',
  feats: 'Feats',
  proficiencies: 'Proficiencies',
}

export function groupWarningsByCategory(
  warnings: readonly CharacterCampaignWarning[],
): Partial<Record<CharacterCampaignWarningCategory, CharacterCampaignWarning[]>> {
  return warnings.reduce<
    Partial<Record<CharacterCampaignWarningCategory, CharacterCampaignWarning[]>>
  >((groups, warning) => {
    const current = groups[warning.category] ?? []
    groups[warning.category] = [...current, warning]
    return groups
  }, {})
}

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
