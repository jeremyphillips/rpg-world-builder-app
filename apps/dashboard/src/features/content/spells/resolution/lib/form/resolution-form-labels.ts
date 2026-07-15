import {
  ABILITY_IDS,
  getAbilityLabel,
  getSpellApplicationPatternKindLabel,
  getSpellResolutionAttackTypeLabel,
  getSpellResolutionProximityKindLabel,
  getSpellResolutionTargetKindLabel,
  SPELL_APPLICATION_PATTERN_KINDS,
  SPELL_RESOLUTION_APPLICATION_AMOUNT_ENTRIES,
  SPELL_RESOLUTION_APPLICATION_AMOUNTS,
  SPELL_RESOLUTION_ATTACK_TYPES,
  SPELL_RESOLUTION_EXTERNAL_PROXIMITY_KINDS,
  SPELL_RESOLUTION_PROXIMITY_KINDS,
  SPELL_RESOLUTION_TARGET_KINDS,
  type SpellApplicationPatternKind,
  type SpellResolutionApplicationAmount,
  type SpellResolutionAttackType,
  type SpellResolutionExternalProximityKind,
  type SpellResolutionProximityKind,
  type SpellResolutionTargetKind,
  getSpellResolutionSelectionModeLabel,
  getSpellResolutionTargetCountKindLabel,
  SPELL_RESOLUTION_SELECTION_MODES,
  SPELL_RESOLUTION_TARGET_COUNT_KINDS,
  type SpellResolutionSelectionMode,
  type SpellResolutionTargetCountKind,
} from '@rpg/contracts'
import { toOptions, type FieldOption } from '@rpg/ui/form'

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
  notSavedBanner: 'Resolution is not saved yet.',
  hybridNoticeTitle: 'Hybrid spell',
  hybridNoticeBody:
    'Projectile or beam scaling is still on legacy root effects. Use Application pattern → Projectiles on this tab when you can, or edit root effects on the read model until catalog consolidation completes.',
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
} as const

export const RESOLUTION_OUTCOME_AMOUNT_OPTIONS: FieldOption[] = toOptions(
  SPELL_RESOLUTION_APPLICATION_AMOUNTS,
  Object.fromEntries(
    SPELL_RESOLUTION_APPLICATION_AMOUNTS.map((amount) => [
      amount,
      SPELL_RESOLUTION_APPLICATION_AMOUNT_ENTRIES[amount].label,
    ]),
  ) as Record<SpellResolutionApplicationAmount, string>,
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
  damageType: 'Damage type',
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
  SPELL_RESOLUTION_TARGET_KINDS,
  Object.fromEntries(
    SPELL_RESOLUTION_TARGET_KINDS.map((kind) => [kind, getSpellResolutionTargetKindLabel(kind)]),
  ) as Record<SpellResolutionTargetKind, string>,
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
  SPELL_RESOLUTION_SELECTION_MODES,
  Object.fromEntries(
    SPELL_RESOLUTION_SELECTION_MODES.map((mode) => [
      mode,
      getSpellResolutionSelectionModeLabel(mode),
    ]),
  ) as Record<SpellResolutionSelectionMode, string>,
)

export const resolutionCountKindOptions: FieldOption[] = toOptions(
  SPELL_RESOLUTION_TARGET_COUNT_KINDS,
  Object.fromEntries(
    SPELL_RESOLUTION_TARGET_COUNT_KINDS.map((kind) => [
      kind,
      getSpellResolutionTargetCountKindLabel(kind),
    ]),
  ) as Record<SpellResolutionTargetCountKind, string>,
)

export const resolutionProximityKindOptions: FieldOption[] = toOptions(
  SPELL_RESOLUTION_EXTERNAL_PROXIMITY_KINDS,
  Object.fromEntries(
    SPELL_RESOLUTION_EXTERNAL_PROXIMITY_KINDS.map((kind) => [
      kind,
      getSpellResolutionProximityKindLabel(kind),
    ]),
  ) as Record<SpellResolutionExternalProximityKind, string>,
)

/** @deprecated Proximity options included legacy self — use resolutionProximityKindOptions. */
export const resolutionProximityKindOptionsWithSelf: FieldOption[] = toOptions(
  SPELL_RESOLUTION_PROXIMITY_KINDS,
  Object.fromEntries(
    SPELL_RESOLUTION_PROXIMITY_KINDS.map((kind) => [
      kind,
      getSpellResolutionProximityKindLabel(kind),
    ]),
  ) as Record<SpellResolutionProximityKind, string>,
)
