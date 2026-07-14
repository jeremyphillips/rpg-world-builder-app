import {
  ABILITY_IDS,
  getAbilityLabel,
  getSpellApplicationPatternKindLabel,
  getSpellResolutionAttackTypeLabel,
  getSpellResolutionProximityKindLabel,
  getSpellResolutionTargetKindLabel,
  SPELL_APPLICATION_PATTERN_KINDS,
  SPELL_RESOLUTION_ATTACK_TYPES,
  SPELL_RESOLUTION_PROXIMITY_KINDS,
  SPELL_RESOLUTION_TARGET_KINDS,
  type SpellApplicationPatternKind,
  type SpellResolutionAttackType,
  type SpellResolutionProximityKind,
  type SpellResolutionTargetKind,
} from '@rpg/contracts'
import { toOptions, type FieldOption } from '@rpg/ui/form'

export const RESOLUTION_SECTION_LABELS = {
  target: 'Target',
  check: 'How it resolves',
  resolution: 'Resolution',
  effectsAndOutcomes: 'Effects & outcomes',
  effectsAndOutcomesHint: 'Define what the spell does, then choose when each effect applies.',
  authoredEffects: 'Authored effects',
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
    'Choose which authored effects apply to each resolution branch and add optional prose.',
  outcomeEmptySummary: 'No modeled effect',
  configureMissOutcome: 'Configure miss outcome',
  addOutcomeApplication: 'Add effect application',
  primaryOutcomeEmptyWarning:
    'The primary outcome for this resolution method has no modeled effects or additional behavior.',
  hitNote: 'Additional behavior',
} as const

export const RESOLUTION_OUTCOME_AMOUNT_OPTIONS = [
  { value: 'full', label: 'Full' },
  { value: 'half', label: 'Half' },
] as const

export const RESOLUTION_FIELD_LABELS = {
  target: '',
  targetCount: 'Target count',
  targetKind: 'Target kind',
  proximityKind: 'Proximity',
  proximityDistance: 'Distance',
  proximityReachDistance: 'Reach distance',
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

export const resolutionProximityKindOptions: FieldOption[] = toOptions(
  SPELL_RESOLUTION_PROXIMITY_KINDS,
  Object.fromEntries(
    SPELL_RESOLUTION_PROXIMITY_KINDS.map((kind) => [
      kind,
      getSpellResolutionProximityKindLabel(kind),
    ]),
  ) as Record<SpellResolutionProximityKind, string>,
)
