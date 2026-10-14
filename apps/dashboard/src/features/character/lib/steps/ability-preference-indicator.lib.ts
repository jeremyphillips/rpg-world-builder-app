import {
  ABILITY_IDS,
  characterBuilderAbilityRecommendationMessages,
  formatFieldMessage,
  type Ability,
  type AbilityPreference,
} from '@rpg/contracts'

export function groupAbilityPreferencesByAbility(
  preferences: readonly AbilityPreference[],
): Map<Ability, AbilityPreference[]> {
  const grouped = new Map<Ability, AbilityPreference[]>()

  for (const preference of preferences) {
    const existing = grouped.get(preference.ability)
    if (existing) {
      existing.push(preference)
    } else {
      grouped.set(preference.ability, [preference])
    }
  }

  return grouped
}

export function formatAbilityPreferenceIndicatorLabel(
  preferences: readonly AbilityPreference[],
): string {
  return preferences
    .map((preference) =>
      formatFieldMessage(
        preference.emphasis === 'primary'
          ? characterBuilderAbilityRecommendationMessages.preferenceTooltipPrimary({
              className: preference.className,
            })
          : characterBuilderAbilityRecommendationMessages.preferenceTooltipSecondary({
              className: preference.className,
            }),
      ),
    )
    .join(' ')
}

export function buildAbilityPreferenceLabelsByAbility(
  preferences: readonly AbilityPreference[],
): Partial<Record<Ability, string>> {
  const grouped = groupAbilityPreferencesByAbility(preferences)
  const labels: Partial<Record<Ability, string>> = {}

  for (const ability of ABILITY_IDS) {
    const entries = grouped.get(ability)
    if (entries && entries.length > 0) {
      labels[ability] = formatAbilityPreferenceIndicatorLabel(entries)
    }
  }

  return labels
}
