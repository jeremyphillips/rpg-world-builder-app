import {
  SPELLCASTING_ABILITY_GROUP_LABELS,
  abilityModifier,
  abilitySaveDc,
  buildGroupedSpellcastingAbilityOptions,
  CHALLENGE_RATING_MECHANICS,
  findSpellCastingSource,
  formatSignedModifier,
  getAbilityLabel,
  spellAttackBonus,
  weaponAttackBonus,
  type Ability,
  type ChallengeRating,
  type SpellCastingSections,
} from '@rpg/contracts'
import type { FieldOption, SelectFieldOptionListItem, SelectOptionTrailing } from '@rpg/ui/form'

import type { MonsterFormValues } from '../monster-form-values'
import {
  MONSTER_CASTING_SHARE_GROUP_LABEL,
  sharedCastingOptions,
} from './monster-action-casting-summary'

/** Conventional ability order for an authored attack bonus. Not an ability-vocabulary category. */
const ATTACK_BONUS_COMMON_ABILITY_IDS = ['str', 'dex'] as const satisfies readonly Ability[]
const ATTACK_BONUS_OTHER_ABILITY_IDS = [
  'con',
  'int',
  'wis',
  'cha',
] as const satisfies readonly Ability[]

export type MonsterCastingAbilityPreview = 'save-dc' | 'attack-bonus'

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
  } as SpellCastingSections
}

function formatSaveDcTrailing(dc: number): SelectOptionTrailing {
  return { text: `DC ${dc}`, variant: 'strong' }
}

function formatAttackBonusTrailing(bonus: number): SelectOptionTrailing {
  return { text: `${formatSignedModifier(bonus)} to hit`, variant: 'strong' }
}

function withTrailing(
  options: readonly { value: string; label: string }[],
  trailingFor: (value: string) => SelectOptionTrailing | undefined,
): FieldOption[] {
  return options.map((option) => {
    const trailing = trailingFor(option.value)
    return trailing ? { ...option, trailing } : option
  })
}

function abilityGroup(
  label: string,
  ids: readonly Ability[],
  trailingFor: (ability: Ability) => SelectOptionTrailing | undefined,
): SelectFieldOptionListItem {
  return {
    kind: 'group',
    label,
    options: withTrailing(
      ids.map((ability) => ({ value: ability, label: getAbilityLabel(ability) })),
      (value) => trailingFor(value as Ability),
    ),
  }
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

/** Spellcasting attack bonus. Matches the authored profile, which always includes proficiency. */
export function spellAttackTrailingForAbility(
  values: MonsterFormValues,
  ability: Ability,
): SelectOptionTrailing | undefined {
  const prof = proficiencyBonus(values.challengeRating)
  const score = abilityScore(values, ability)
  if (prof === undefined || score === undefined) return undefined
  return formatAttackBonusTrailing(spellAttackBonus(score, prof))
}

/** Ability-based attack bonus. Omits a preview until proficiency is authored. */
export function abilityAttackTrailingForAbility(
  values: MonsterFormValues,
  ability: Ability,
  proficient: boolean | undefined,
): SelectOptionTrailing | undefined {
  const prof = proficiencyBonus(values.challengeRating)
  const score = abilityScore(values, ability)
  if (prof === undefined || score === undefined || typeof proficient !== 'boolean') return undefined
  return formatAttackBonusTrailing(weaponAttackBonus(abilityModifier(score), proficient, prof))
}

function castingTrailingForAbility(
  values: MonsterFormValues,
  ability: Ability,
  preview: MonsterCastingAbilityPreview,
): SelectOptionTrailing | undefined {
  return preview === 'attack-bonus'
    ? spellAttackTrailingForAbility(values, ability)
    : spellSaveDcTrailingForAbility(values, ability)
}

export function monsterCastingAbilitySelectOptions(
  values: MonsterFormValues,
  currentActionId: string,
  preview: MonsterCastingAbilityPreview,
): SelectFieldOptionListItem[] {
  const shared = sharedCastingOptions(values, currentActionId)
  const sections = spellCastingSections(values)
  const trailingFor = (ability: Ability) => castingTrailingForAbility(values, ability, preview)
  const abilityGroups = buildGroupedSpellcastingAbilityOptions().map((group) =>
    abilityGroup(
      group.label,
      group.options.map((option) => option.value as Ability),
      trailingFor,
    ),
  )
  if (shared.length === 0) return abilityGroups

  const sharedGroup: SelectFieldOptionListItem = {
    kind: 'group',
    label: MONSTER_CASTING_SHARE_GROUP_LABEL,
    options: withTrailing(shared, (entryId) => {
      const source = findSpellCastingSource(sections, entryId)
      return source ? trailingFor(source.ability) : undefined
    }).map((option) => ({ ...option, value: `shared:${option.value}` })),
  }
  return [sharedGroup, ...abilityGroups]
}

export function monsterAttackAbilitySelectOptions(
  values: MonsterFormValues,
  proficient: boolean | undefined,
): SelectFieldOptionListItem[] {
  const trailingFor = (ability: Ability) =>
    abilityAttackTrailingForAbility(values, ability, proficient)
  return [
    abilityGroup(
      SPELLCASTING_ABILITY_GROUP_LABELS.common,
      ATTACK_BONUS_COMMON_ABILITY_IDS,
      trailingFor,
    ),
    abilityGroup(
      SPELLCASTING_ABILITY_GROUP_LABELS.advanced,
      ATTACK_BONUS_OTHER_ABILITY_IDS,
      trailingFor,
    ),
  ]
}
