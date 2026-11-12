import {
  ABILITY_IDS,
  abilitySaveDc,
  CHALLENGE_RATING_MECHANICS,
  findSpellCastingSource,
  getAbilityLabel,
  type Ability,
  type ChallengeRating,
  type SpellCastingSections,
} from '@rpg/contracts'
import type { SelectFieldOptionListItem, SelectOptionTrailing } from '@rpg/ui/form'

import type { MonsterFormValues } from '../monster-form-values'
import {
  MONSTER_CASTING_ABILITY_GROUP_LABEL,
  MONSTER_CASTING_SHARE_GROUP_LABEL,
  sharedCastingOptions,
} from './monster-action-casting-summary'

function proficiencyBonus(challengeRating: unknown): number | undefined {
  if (typeof challengeRating !== 'string') return undefined
  if (!(challengeRating in CHALLENGE_RATING_MECHANICS)) return undefined
  return CHALLENGE_RATING_MECHANICS[challengeRating as ChallengeRating].proficiencyBonus
}

function abilityScore(values: MonsterFormValues, ability: Ability): number | undefined {
  const score = values.abilityScores?.[ability]
  return typeof score === 'number' && Number.isFinite(score) ? score : undefined
}

function spellCastingSections(values: MonsterFormValues): SpellCastingSections {
  return {
    actions: values.actions,
    bonusActions: values.bonusActions,
    reactions: values.reactions,
    legendaryActions: values.legendaryActions,
  }
}

function formatSaveDcTrailing(dc: number): SelectOptionTrailing {
  return { text: `DC ${dc}`, variant: 'strong' }
}

export function spellSaveDcTrailingForAbility(
  values: MonsterFormValues,
  ability: Ability,
): SelectOptionTrailing | undefined {
  const prof = proficiencyBonus(values.challengeRating)
  const score = abilityScore(values, ability)
  if (prof === undefined || score === undefined) return undefined
  return formatSaveDcTrailing(abilitySaveDc(score, prof))
}

export function monsterCastingAbilitySelectOptions(
  values: MonsterFormValues,
  currentActionId: string,
): SelectFieldOptionListItem[] {
  const shared = sharedCastingOptions(values, currentActionId)
  const sections = spellCastingSections(values)

  const abilitiesGroup = {
    kind: 'group' as const,
    label: MONSTER_CASTING_ABILITY_GROUP_LABEL,
    options: ABILITY_IDS.map((ability) => {
      const trailing = spellSaveDcTrailingForAbility(values, ability)
      return {
        value: ability,
        label: getAbilityLabel(ability),
        ...(trailing ? { trailing } : {}),
      }
    }),
  }

  const sharedGroup = {
    kind: 'group' as const,
    label: MONSTER_CASTING_SHARE_GROUP_LABEL,
    options: shared.map((option) => {
      const source = findSpellCastingSource(sections, option.value)
      const trailing = source ? spellSaveDcTrailingForAbility(values, source.ability) : undefined
      return {
        value: `shared:${option.value}`,
        label: option.label,
        ...(trailing ? { trailing } : {}),
      }
    }),
  }

  if (shared.length === 0) return [abilitiesGroup]
  return [sharedGroup, abilitiesGroup]
}
