import {
  ABILITY_IDS,
  getAbilityLabel,
  getSpellResolutionAttackTypeLabel,
  getSpellResolutionRangeKindLabel,
  getSpellResolutionTargetKindLabel,
  SPELL_RESOLUTION_ATTACK_TYPES,
  SPELL_RESOLUTION_RANGE_KINDS,
  SPELL_RESOLUTION_TARGET_KINDS,
  type SpellResolutionAttackType,
  type SpellResolutionRangeKind,
  type SpellResolutionTargetKind,
} from '@rpg/contracts'
import { toOptions, type FieldOption } from '@rpg/ui/form'

export const RESOLUTION_SECTION_LABELS = {
  target: 'Target',
  resolution: 'Resolution',
  damage: 'Damage',
  outcomes: 'Outcomes',
  preview: 'Preview',
  addResolution: 'Add resolution',
  removeResolution: 'Remove resolution',
  emptyState: 'No structured resolution configured.',
  notSavedBanner: 'Resolution is not saved yet.',
  hitNote: 'Additional behavior',
} as const

export const RESOLUTION_FIELD_LABELS = {
  targetCount: 'Target count',
  targetKind: 'Target kind',
  methodKind: 'Resolution method',
  attackType: 'Attack type',
  saveAbility: 'Saving throw ability',
  rangeKind: 'Range',
  rangeDistanceFt: 'Distance (feet)',
  reachDistanceFt: 'Reach distance (feet)',
  damageRoll: 'Damage roll',
  damageType: 'Damage type',
  hitNote: RESOLUTION_SECTION_LABELS.hitNote,
} as const

export const RESOLUTION_METHOD_KIND_OPTIONS: FieldOption[] = [
  { value: 'attack', label: 'Spell attack' },
  { value: 'saving-throw', label: 'Saving throw' },
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

export const resolutionRangeKindOptions: FieldOption[] = toOptions(
  SPELL_RESOLUTION_RANGE_KINDS,
  Object.fromEntries(
    SPELL_RESOLUTION_RANGE_KINDS.map((kind) => [kind, getSpellResolutionRangeKindLabel(kind)]),
  ) as Record<SpellResolutionRangeKind, string>,
)
