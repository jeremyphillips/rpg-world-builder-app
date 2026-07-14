import {
  ABILITY_IDS,
  getAbilityLabel,
  getSpellResolutionAttackTypeLabel,
  getSpellResolutionProximityKindLabel,
  getSpellResolutionTargetKindLabel,
  SPELL_RESOLUTION_ATTACK_TYPES,
  SPELL_RESOLUTION_PROXIMITY_KINDS,
  SPELL_RESOLUTION_TARGET_KINDS,
  type SpellResolutionAttackType,
  type SpellResolutionProximityKind,
  type SpellResolutionTargetKind,
} from '@rpg/contracts'
import { toOptions, type FieldOption } from '@rpg/ui/form'

export const RESOLUTION_SECTION_LABELS = {
  target: 'Target',
  check: 'Check',
  resolution: 'Resolution',
  effects: 'Effects',
  damage: 'Damage',
  outcomes: 'Outcomes',
  preview: 'Preview',
  addResolution: 'Add resolution',
  emptyState: 'No structured resolution configured.',
  notSavedBanner: 'Resolution is not saved yet.',
  hybridNoticeTitle: 'Hybrid spell',
  hybridNoticeBody:
    'Projectile or beam scaling is modeled in legacy root effects, not in the resolution envelope. Edit those counts on the spell read model until projectile-count lands in resolution.',
  outcomesIncomplete: 'Complete target, method, and effects to preview generated outcomes.',
  hitNote: 'Additional behavior',
} as const

export const RESOLUTION_FIELD_LABELS = {
  target: '',
  targetCount: 'Target count',
  targetKind: 'Target kind',
  proximityKind: 'Proximity',
  proximityDistance: 'Distance',
  proximityReachDistance: 'Reach distance',
  method: 'Method',
  methodKind: 'Method',
  attackType: 'Attack type',
  saveAbility: 'Saving throw',
  damageRoll: 'Damage roll',
  damageType: 'Damage type',
  hitNote: RESOLUTION_SECTION_LABELS.hitNote,
} as const

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
