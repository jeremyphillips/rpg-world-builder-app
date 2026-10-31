import {
  ABILITY_IDS,
  DAMAGE_TYPE_TERM,
  getAbilityLabel,
  getSpellApplicationPatternKindLabel,
  getSpellResolutionAttackTypeLabel,
  getResolutionProximityKindLabel,
  getResolutionTargetKindLabel,
  SPELL_APPLICATION_PATTERN_KINDS,
  RESOLUTION_APPLICATION_AMOUNT_ENTRIES,
  RESOLUTION_APPLICATION_AMOUNTS,
  SPELL_RESOLUTION_ATTACK_TYPES,
  RESOLUTION_PROXIMITY_KINDS,
  RESOLUTION_TARGET_KINDS,
  type SpellApplicationPatternKind,
  type ResolutionApplicationAmount,
  type SpellResolutionAttackType,
  type ResolutionProximityKind,
  type ResolutionTargetKind,
  getResolutionSelectionModeLabel,
  getResolutionTargetCountKindLabel,
  RESOLUTION_SELECTION_MODES,
  RESOLUTION_TARGET_COUNT_KINDS,
  type ResolutionSelectionMode,
  type ResolutionTargetCountKind,
} from '@rpg/contracts'
import { toOptions, type FieldOption } from '@rpg/ui/form'

import { vocabularyFieldLabel } from '@/features/vocabulary'

export const RESOLUTION_SECTION_LABELS = {
  selection: 'Selection',
  target: 'Target',
  check: 'How it resolves',
  resolution: 'Resolution',
  effectsAndOutcomes: 'Effects & outcomes',
  effectsAndOutcomesHint: 'Define what the spell does, then choose when each effect applies.',
  authoredEffects: 'Authored effects',
  authoredEffectsDescription:
    'Define each effect once. Outcome branches reference these effects below.',
  projectiles: 'Projectiles',
  damage: 'Damage',
  outcomeBranches: 'Outcome branches',
  preview: 'Preview',
  addResolution: 'Add resolution',
  emptyState: 'No structured resolution configured.',
  outcomesIncomplete: 'Complete target, method, and effects to preview generated outcomes.',
  outcomesHint:
    'Choose which authored effects apply in each branch and whether each applies fully or partially.',
  outcomeEmptySummary: 'No modeled effect.',
  outcomeNoAuthoredEffectsAvailable: 'No authored effects available.',
  outcomeAuthorEffectsHint: 'Author an effect above to apply it here.',
  outcomeNoCompleteEffectsAvailable: 'No complete effects available.',
  outcomeCompleteEffectsHint: 'Complete an authored effect before applying it.',
  outcomeAllEffectsApplied: 'All authored effects are already applied.',
  outcomeUnavailableGroup: 'Unavailable',
  outcomeAvailableGroup: 'Available',
  outcomeIncompleteEffect: 'Incomplete effect',
  outcomeUnknownEffect: 'Unknown effect',
  configureMissOutcome: 'Configure miss outcome',
  addAuthoredEffect: 'Add effect',
  addAppliedEffect: 'Add applied effect',
  appliedEffects: 'Applied effects',
  primaryOutcomeEmptyWarning:
    'The primary outcome for this resolution method has no modeled effects or additional behavior.',
  hitNote: 'Additional behavior',
  addOutcomeNote: 'Add additional behavior',
  outcomeNotePlaceholder: 'Describe behavior not modeled above...',
  selectionNoneHint: 'This resolution requires no target or origin selection.',
  selectionSelfRecipientHint: 'Recipient — You',
  selectionSelfOriginHint: 'Origin — You (caster is the fixed origin for this area).',
  selectionAffectedAreaHint:
    'Affected — Creatures and objects in the area (not individually selected).',
  progression: 'Progression',
  progressionHint:
    'Define how this spell changes with character level or higher-level spell slots.',
  progressionEmpty: 'No progression configured',
  addProgression: 'Add progression',
  addProgressionTrack: 'Add track',
  progressionCantripMode: 'Character-level thresholds',
  progressionLeveledMode: 'Higher-level slot scaling',
  progressionBaseValue: 'Base value',
  progressionBaseAtLevel: (level: number) => `Base at ${level}${ordinalSuffix(level)} level`,
  progressionEachSlotAbove: (level: number) => `Each slot above ${level}${ordinalSuffix(level)}`,
} as const

function ordinalSuffix(level: number): string {
  const mod100 = level % 100
  if (mod100 >= 11 && mod100 <= 13) return 'th'
  switch (level % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

export const RESOLUTION_OUTCOME_AMOUNT_OPTIONS: FieldOption[] = toOptions(
  RESOLUTION_APPLICATION_AMOUNTS,
  Object.fromEntries(
    RESOLUTION_APPLICATION_AMOUNTS.map((amount) => [
      amount,
      RESOLUTION_APPLICATION_AMOUNT_ENTRIES[amount].label,
    ]),
  ) as Record<ResolutionApplicationAmount, string>,
)

export const RESOLUTION_FIELD_LABELS = {
  selectionMode: 'Selection mode',
  target: '',
  targetCount: 'Target count',
  countKind: 'Target count kind',
  targetKind: 'Target kind',
  proximityKind: 'Proximity',
  proximityDistance: 'Distance',
  proximityReachDistance: 'Reach distance',
  originDistance: 'Origin distance',
  areaOfEffect: 'Area of effect',
  method: 'Method',
  methodKind: 'Method',
  applicationPattern: 'Application pattern',
  applicationPatternHint:
    'Describes how the effects are repeated or distributed. Choose Projectiles when each dart, beam, or similar instance applies the effects separately.',
  projectileCount: 'Count',
  projectileUnitLabelSingular: 'Projectile label (singular)',
  projectileUnitLabelPlural: 'Projectile label (plural)',
  attackType: 'Attack type',
  saveAbility: 'Saving throw',
  damageRoll: 'Damage roll',
  damageType: vocabularyFieldLabel(DAMAGE_TYPE_TERM),
  hitNote: RESOLUTION_SECTION_LABELS.hitNote,
  outcomeApplicationAmount: 'Application',
} as const

export const RESOLUTION_APPLICATION_PATTERN_NONE_OPTION = {
  value: 'none',
  label: 'None',
} as const

export const RESOLUTION_APPLICATION_PATTERN_OPTIONS: FieldOption[] = [
  RESOLUTION_APPLICATION_PATTERN_NONE_OPTION,
  ...toOptions(
    SPELL_APPLICATION_PATTERN_KINDS,
    Object.fromEntries(
      SPELL_APPLICATION_PATTERN_KINDS.map((kind) => [
        kind,
        getSpellApplicationPatternKindLabel(kind),
      ]),
    ) as Record<SpellApplicationPatternKind, string>,
  ),
]

export const RESOLUTION_METHOD_KIND_OPTIONS: FieldOption[] = [
  { value: 'attack', label: 'Spell attack' },
  { value: 'saving-throw', label: 'Saving throw' },
  { value: 'automatic', label: 'Automatic' },
]

export const resolutionTargetKindOptions: FieldOption[] = toOptions(
  RESOLUTION_TARGET_KINDS,
  Object.fromEntries(
    RESOLUTION_TARGET_KINDS.map((kind) => [kind, getResolutionTargetKindLabel(kind)]),
  ) as Record<ResolutionTargetKind, string>,
)

export const resolutionAttackTypeOptions: FieldOption[] = toOptions(
  SPELL_RESOLUTION_ATTACK_TYPES,
  Object.fromEntries(
    SPELL_RESOLUTION_ATTACK_TYPES.map((attackType) => [
      attackType,
      getSpellResolutionAttackTypeLabel(attackType),
    ]),
  ) as Record<SpellResolutionAttackType, string>,
)

export const resolutionSaveAbilityOptions: FieldOption[] = ABILITY_IDS.map((ability) => ({
  value: ability,
  label: getAbilityLabel(ability),
}))

export const resolutionSelectionModeOptions: FieldOption[] = toOptions(
  RESOLUTION_SELECTION_MODES,
  Object.fromEntries(
    RESOLUTION_SELECTION_MODES.map((mode) => [mode, getResolutionSelectionModeLabel(mode)]),
  ) as Record<ResolutionSelectionMode, string>,
)

export const resolutionCountKindOptions: FieldOption[] = toOptions(
  RESOLUTION_TARGET_COUNT_KINDS,
  Object.fromEntries(
    RESOLUTION_TARGET_COUNT_KINDS.map((kind) => [kind, getResolutionTargetCountKindLabel(kind)]),
  ) as Record<ResolutionTargetCountKind, string>,
)

export const resolutionProximityKindOptions: FieldOption[] = toOptions(
  RESOLUTION_PROXIMITY_KINDS,
  Object.fromEntries(
    RESOLUTION_PROXIMITY_KINDS.map((kind) => [kind, getResolutionProximityKindLabel(kind)]),
  ) as Record<ResolutionProximityKind, string>,
)
