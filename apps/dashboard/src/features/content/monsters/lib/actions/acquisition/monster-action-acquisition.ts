import {
  ACTION_PRESET_IDS,
  DEFAULT_RESOLUTION_TARGET,
  getActionPreset,
  getActionVocabularyEntry,
  getActionVocabularySearchTerms,
  getDamageTypeLabel,
  getMonsterActionKindLabel,
  LEAP_DISTANCE_DEFAULT,
  LEAP_MOVEMENT_DEFAULT,
  listSpecialMenuActionPresetIds,
  MONSTER_SPELLCASTING_ACTION_NAME,
  PARRY_AC_BONUS_DEFAULT,
  PRIMARY_SPELLCASTING_PROFILE,
  acquisitionStateForItem,
  MONSTER_ACTION_KIND_ENTRIES,
  monsterActionOccurrenceMessages,
  monsterSectionAllowsKind,
  monsterSectionAllowsPreset,
  type ActionPresetId,
  type MonsterActionSectionRows,
} from '@rpg/contracts'
import { conventionalSpellcastingSources } from '../spell/monster-action-casting-summary'
import type { FormCastingSections } from '../../casting/spellcasting-sources.lib'
import type { MonsterActionSection } from '../references/monster-action-equipment-references'

import {
  MONSTER_ACQUISITION_SPELL_PRIMARY_DESCRIPTION,
  MONSTER_ACQUISITION_SPELL_STANDALONE_DESCRIPTION,
  MONSTER_CAST_SPELL_LABEL,
  MONSTER_REACTION_CAST_SPELL_DESCRIPTION,
  MONSTER_REACTION_CUSTOM_DESCRIPTION,
  MONSTER_REACTION_CUSTOM_LABEL,
  MONSTER_ACTION_REFERENCE_ACQUISITION_LABEL,
  MONSTER_SHAPE_SHIFT_ACQUISITION_DESCRIPTION,
  LEGENDARY_CAST_SPELL_DISABLED_NOTE,
  LEGENDARY_REFERENCE_DISABLED_NOTE,
  monsterAddWeaponShortcut,
} from '../../monster-form-labels'
import type { ButtonDropdownItem } from '@rpg/ui'
import {
  type AcquisitionAvailabilityFacts,
  type AcquisitionOption,
  resolveAcquisitionAvailability,
  toAcquisitionDropdownItem,
} from '../../../../lib/acquisition'
import { createMonsterRowId } from '../../monster-row-id'
import {
  isLegendaryAcquisitionCategory,
  type LegendaryAcquisitionCategory,
} from '../legendary/legendary-action-category'
import type { MonsterActionDraftRow } from '../monster-action-presets'

export const MONSTER_ACTION_ACQUISITION_GROUPS = [
  { id: 'equipped', label: 'Equipped weapons' },
  { id: 'natural', label: 'Natural attacks' },
  { id: 'special', label: 'Special actions' },
  { id: 'movement', label: 'Movement' },
  { id: 'other', label: 'General' },
] as const

export type MonsterActionAcquisitionGroupId =
  | (typeof MONSTER_ACTION_ACQUISITION_GROUPS)[number]['id']
  | 'existing'
  | 'new'

export type MonsterActionAcquisitionChoice =
  | { type: 'weapon-entry'; entryId: string }
  | { type: 'add-weapon' }
  | { type: 'natural'; presetId: ActionPresetId }
  | { type: 'other-natural' }
  | { type: 'preset'; presetId: ActionPresetId }
  | {
      type: 'create'
      kind: 'attack' | 'special' | 'save' | 'shape-shift' | 'leap' | 'teleport' | 'take-actions'
    }
  | { type: 'create'; kind: 'spell'; spellAcquisition: 'primary' | 'standalone' }
  | { type: 'legendary'; category: LegendaryAcquisitionCategory }
  | { type: 'reaction'; category: 'reference' | 'parry' | 'cast-spell' | 'custom' }

const SPECIAL_MENU_ORDER = ['multiattack', 'constrict', 'breath-weapon'] as const

function kindDescription(kind: keyof typeof MONSTER_ACTION_KIND_ENTRIES): string {
  return MONSTER_ACTION_KIND_ENTRIES[kind].description
}

const OTHER_ITEMS: readonly AcquisitionOption[] = [
  {
    id: 'create:attack',
    label: 'Attack roll',
    groupId: 'other',
    description: { status: 'ready', text: kindDescription('attack') },
    availability: { status: 'available' },
  },
  {
    id: 'create:spell',
    label: MONSTER_SPELLCASTING_ACTION_NAME,
    groupId: 'other',
    description: { status: 'ready', text: MONSTER_ACQUISITION_SPELL_PRIMARY_DESCRIPTION },
    availability: { status: 'available' },
  },
  {
    id: 'create:spell-standalone',
    label: MONSTER_CAST_SPELL_LABEL,
    groupId: 'other',
    description: { status: 'ready', text: MONSTER_ACQUISITION_SPELL_STANDALONE_DESCRIPTION },
    availability: { status: 'available' },
  },
  {
    id: 'create:special',
    label: 'Custom ability',
    groupId: 'other',
    description: { status: 'ready', text: kindDescription('special') },
    availability: { status: 'available' },
  },
]

const SHAPE_SHIFT_ACQUISITION_ITEM: AcquisitionOption = {
  id: 'create:shape-shift',
  label: getMonsterActionKindLabel('shape-shift'),
  groupId: 'other',
  description: { status: 'ready', text: MONSTER_SHAPE_SHIFT_ACQUISITION_DESCRIPTION },
  availability: { status: 'available' },
}

function specialMenuRank(presetId: ActionPresetId): number {
  const index = SPECIAL_MENU_ORDER.indexOf(presetId as (typeof SPECIAL_MENU_ORDER)[number])
  return index === -1 ? SPECIAL_MENU_ORDER.length : index
}

function isAttackRollPreset(id: ActionPresetId): boolean {
  return getActionPreset(id)?.mechanics === 'attack-roll'
}

const EXACT_ACQUISITION_CHOICES: Record<string, MonsterActionAcquisitionChoice> = {
  'add-weapon': { type: 'add-weapon' },
  'create:attack': { type: 'create', kind: 'attack' },
  'create:spell': { type: 'create', kind: 'spell', spellAcquisition: 'primary' },
  'create:spell-standalone': { type: 'create', kind: 'spell', spellAcquisition: 'standalone' },
  'create:special': { type: 'create', kind: 'special' },
  'create:save': { type: 'create', kind: 'save' },
  'create:shape-shift': { type: 'create', kind: 'shape-shift' },
  'natural:other': { type: 'other-natural' },
  'reaction:reference': { type: 'reaction', category: 'reference' },
  'reaction:parry': { type: 'reaction', category: 'parry' },
  'reaction:cast-spell': { type: 'reaction', category: 'cast-spell' },
  'reaction:custom': { type: 'reaction', category: 'custom' },
  'create:leap': { type: 'create', kind: 'leap' },
  'create:teleport': { type: 'create', kind: 'teleport' },
  'create:take-actions': { type: 'create', kind: 'take-actions' },
  'bonus:leap': { type: 'create', kind: 'leap' },
  'bonus:teleport': { type: 'create', kind: 'teleport' },
  'bonus:take-actions': { type: 'create', kind: 'take-actions' },
}

function legendaryAcquisitionChoice(value: string): MonsterActionAcquisitionChoice | undefined {
  if (!isLegendaryAcquisitionCategory(value)) return undefined
  return { type: 'legendary', category: value }
}

function presetAcquisitionChoice(value: string): MonsterActionAcquisitionChoice | undefined {
  const preset = getActionPreset(value)
  if (!preset || preset.mechanics === 'attack-roll') return undefined
  return { type: 'preset', presetId: value as ActionPresetId }
}

function parsePrefixedAcquisitionId(id: string): MonsterActionAcquisitionChoice | undefined {
  const separator = id.indexOf(':')
  if (separator < 0) return undefined
  const prefix = id.slice(0, separator)
  const value = id.slice(separator + 1)
  if (!value) return undefined
  if (prefix === 'weapon-entry') return { type: 'weapon-entry', entryId: value }
  if (prefix === 'natural' && isAttackRollPreset(value as ActionPresetId)) {
    return { type: 'natural', presetId: value as ActionPresetId }
  }
  if (prefix === 'legendary') return legendaryAcquisitionChoice(value)
  if (prefix === 'preset') return presetAcquisitionChoice(value)
  return undefined
}

export function parseMonsterActionAcquisitionId(
  id: string,
): MonsterActionAcquisitionChoice | undefined {
  return EXACT_ACQUISITION_CHOICES[id] ?? parsePrefixedAcquisitionId(id)
}

function availabilityFactsFromOption(
  availability: AcquisitionOption['availability'],
): AcquisitionAvailabilityFacts {
  if (availability.status === 'available') return {}
  if (availability.code === 'occurrence') return { occurrence: { message: availability.message } }
  if (availability.code === 'prerequisite') {
    return { prerequisite: { message: availability.message } }
  }
  return { readiness: { message: availability.message } }
}

function withAcquisitionPolicy(
  item: AcquisitionOption,
  sectionRows: MonsterActionSectionRows,
  section: MonsterActionSection | undefined,
  prerequisiteMessage?: string,
): AcquisitionOption {
  const state = acquisitionStateForItem(item.id, sectionRows, { section })
  const prior = availabilityFactsFromOption(item.availability)
  return {
    ...item,
    availability: resolveAcquisitionAvailability({
      ...prior,
      occurrence: state.disabled && state.note ? { message: state.note } : prior.occurrence,
      prerequisite: prerequisiteMessage ? { message: prerequisiteMessage } : prior.prerequisite,
    }),
  }
}

function applyAcquisitionPolicies(
  items: AcquisitionOption[],
  sectionRows: MonsterActionSectionRows,
  section: MonsterActionSection | undefined,
  shapeShiftDisabledReason?: string,
): AcquisitionOption[] {
  return items.map((item) =>
    withAcquisitionPolicy(
      item,
      sectionRows,
      section,
      item.id === 'create:shape-shift' ? shapeShiftDisabledReason : undefined,
    ),
  )
}

function portableMovementItems(section: MonsterActionSection | undefined): AcquisitionOption[] {
  const items: AcquisitionOption[] = []
  if (section && monsterSectionAllowsKind(section, 'teleport')) {
    items.push({
      id: 'create:teleport',
      label: getMonsterActionKindLabel('teleport'),
      groupId: 'movement',
      description: { status: 'ready', text: kindDescription('teleport') },
      availability: { status: 'available' },
    })
  }
  if (section && monsterSectionAllowsKind(section, 'leap')) {
    items.push({
      id: 'create:leap',
      label: getMonsterActionKindLabel('leap'),
      groupId: 'movement',
      description: { status: 'ready', text: kindDescription('leap') },
      availability: { status: 'available' },
    })
  }
  return items
}

export function monsterActionAcquisitionItems(input: {
  weapons: readonly { entryId: string; label: string; equipped: boolean }[]
  allowAddWeapon: boolean
  weaponActions?: readonly { id: string; equipmentEntryId?: string }[]
  section?: MonsterActionSection
  sectionRows?: MonsterActionSectionRows
  hasReferenceTargets?: boolean
  spellCatalogReady?: boolean
  shapeShiftDisabledReason?: string
}): ButtonDropdownItem[] {
  const sectionRows: MonsterActionSectionRows = input.sectionRows ?? {
    actions: [],
    bonusActions: [],
    reactions: [],
    legendaryActions: { actions: [] },
  }
  if (input.section === 'reactions') {
    return applyAcquisitionPolicies(
      reactionAcquisitionItems(
        input.hasReferenceTargets === true,
        input.spellCatalogReady !== false,
      ),
      sectionRows,
      input.section,
    ).map(toAcquisitionDropdownItem)
  }
  const movement = portableMovementItems(input.section)
  const equipped = input.weapons.map((weapon) => {
    const existing = input.weaponActions?.find(
      (action) => action.equipmentEntryId === weapon.entryId,
    )
    return {
      id: `weapon-entry:${weapon.entryId}`,
      label: weapon.label,
      groupId: 'equipped' as const,
      description: { status: 'ready', text: kindDescription('weapon') },
      availability: resolveAcquisitionAvailability({
        occurrence: existing
          ? { message: monsterActionOccurrenceMessages.weaponEquipmentDuplicate() }
          : undefined,
        prerequisite: !weapon.equipped ? { message: 'Not equipped' } : undefined,
      }),
    }
  })
  const natural = ACTION_PRESET_IDS.filter(isAttackRollPreset).map((presetId) => {
    const preset = getActionPreset(presetId)
    const vocabulary = preset ? getActionVocabularyEntry(preset.vocabularyId) : undefined
    const damageType = preset?.mechanics === 'attack-roll' ? preset.defaults.damageType : undefined
    return {
      id: `natural:${presetId}`,
      label: vocabulary?.label ?? presetId,
      groupId: 'natural' as const,
      description: { status: 'ready' as const, text: vocabulary?.description ?? '' },
      classification: damageType ? getDamageTypeLabel(damageType) : undefined,
      search: { includeSupporting: false as const },
      searchTerms: preset ? getActionVocabularySearchTerms(preset.vocabularyId) : [],
      availability: { status: 'available' as const },
    }
  })
  const special = listSpecialMenuActionPresetIds()
    .filter((presetId) => monsterSectionAllowsPreset(input.section ?? 'actions', presetId))
    .map((presetId, index) => ({ presetId, index }))
    .sort(
      (left, right) =>
        specialMenuRank(left.presetId) - specialMenuRank(right.presetId) ||
        left.index - right.index,
    )
    .map(({ presetId }) => {
      const preset = getActionPreset(presetId)
      const vocabulary = preset ? getActionVocabularyEntry(preset.vocabularyId) : undefined
      return {
        id: `preset:${presetId}`,
        label: vocabulary?.label ?? presetId,
        groupId: 'special' as const,
        description: {
          status: 'ready' as const,
          text:
            presetId === 'multiattack'
              ? kindDescription('multiattack')
              : (vocabulary?.description ?? ''),
        },
        search: { includeSupporting: false as const },
        searchTerms: preset ? getActionVocabularySearchTerms(preset.vocabularyId) : [],
        availability: { status: 'available' as const },
      }
    })
  const weaponsAllowed = input.section === undefined || input.section === 'actions'
  return applyAcquisitionPolicies(
    [
      ...(weaponsAllowed
        ? [
            ...equipped,
            {
              id: 'add-weapon',
              label: monsterAddWeaponShortcut(),
              groupId: 'equipped' as const,
              description: { status: 'ready', text: kindDescription('weapon') },
              availability: resolveAcquisitionAvailability({
                readiness: !input.allowAddWeapon
                  ? { message: 'Equipment catalog is not ready' }
                  : undefined,
              }),
            },
            ...natural,
            {
              id: 'natural:other',
              label: 'Other natural attack',
              groupId: 'natural' as const,
              description: { status: 'ready', text: kindDescription('natural-weapon') },
              availability: { status: 'available' },
            },
          ]
        : []),
      ...special,
      ...movement,
      ...generalAcquisitionItems(input.section),
    ] as AcquisitionOption[],
    sectionRows,
    input.section,
    input.shapeShiftDisabledReason,
  ).map(toAcquisitionDropdownItem)
}

function reactionAcquisitionItems(
  hasReferenceTargets: boolean,
  spellCatalogReady: boolean,
): AcquisitionOption[] {
  return [
    {
      id: 'reaction:reference',
      label: MONSTER_ACTION_REFERENCE_ACQUISITION_LABEL,
      groupId: 'existing',
      description: { status: 'ready', text: kindDescription('action-reference') },
      availability: resolveAcquisitionAvailability({
        prerequisite: !hasReferenceTargets
          ? { message: LEGENDARY_REFERENCE_DISABLED_NOTE }
          : undefined,
      }),
    },
    {
      id: 'reaction:parry',
      label: getMonsterActionKindLabel('parry'),
      groupId: 'new',
      description: { status: 'ready', text: kindDescription('parry') },
      availability: { status: 'available' },
    },
    {
      id: 'reaction:cast-spell',
      label: MONSTER_CAST_SPELL_LABEL,
      groupId: 'new',
      description: { status: 'ready', text: MONSTER_REACTION_CAST_SPELL_DESCRIPTION },
      availability: resolveAcquisitionAvailability({
        readiness: !spellCatalogReady ? { message: LEGENDARY_CAST_SPELL_DISABLED_NOTE } : undefined,
      }),
    },
    {
      id: 'reaction:custom',
      label: MONSTER_REACTION_CUSTOM_LABEL,
      groupId: 'new',
      description: { status: 'ready', text: MONSTER_REACTION_CUSTOM_DESCRIPTION },
      availability: { status: 'available' },
    },
  ]
}

function generalAcquisitionItems(section: MonsterActionSection | undefined): AcquisitionOption[] {
  const standalone = OTHER_ITEMS.filter((item) => item.id === 'create:spell-standalone')
  const rest = OTHER_ITEMS.filter(
    (item) => item.id !== 'create:spell' && item.id !== 'create:spell-standalone',
  )
  const spellcasting = OTHER_ITEMS.find((item) => item.id === 'create:spell')
  const saveItem: AcquisitionOption = {
    id: 'create:save',
    label: 'Saving throw',
    groupId: 'other',
    description: { status: 'ready', text: kindDescription('save') },
    availability: { status: 'available' },
  }
  if (section === 'bonusActions') {
    return [
      {
        id: 'create:take-actions',
        label: getMonsterActionKindLabel('take-actions'),
        groupId: 'other' as const,
        description: { status: 'ready', text: kindDescription('take-actions') },
        availability: { status: 'available' },
      },
      ...rest,
      saveItem,
      SHAPE_SHIFT_ACQUISITION_ITEM,
      ...standalone,
    ]
  }
  if (section === 'reactions') return []
  return [
    ...rest,
    ...(spellcasting ? [spellcasting] : []),
    SHAPE_SHIFT_ACQUISITION_ITEM,
    ...standalone,
  ]
}

/** Starting damage for a new Attack or Other natural attack. Not applied to loaded rows. */
function authoredStartingDamage(): { dice: { count: 1; faces: 6 } } {
  return { dice: { count: 1, faces: 6 } }
}

function draftFromPreset(presetId: ActionPresetId): MonsterActionDraftRow {
  const preset = getActionPreset(presetId)
  const id = createMonsterRowId()
  if (!preset) {
    throw new Error(`Unknown action preset: ${presetId}`)
  }
  if (preset.mechanics === 'attack-roll') {
    return {
      id,
      kind: 'natural-weapon',
      preset: presetId,
      form: preset.defaults.naturalForm,
      damageType: preset.defaults.damageType,
      mode: preset.defaults.mode,
      reach: preset.defaults.reach,
      damage: { ...preset.defaults.damage },
    }
  }
  if (preset.mechanics === 'saving-throw') {
    return {
      id,
      kind: 'save',
      preset: presetId,
      dcSource: preset.defaults.dcSource,
      resolution: preset.defaults.resolution,
      ...(preset.defaults.limitedUse ? { limitedUse: preset.defaults.limitedUse } : {}),
    }
  }
  return {
    id,
    kind: 'multiattack',
    preset: presetId,
    steps: [],
  }
}

export function createActionDraft(
  kind: 'leap' | 'teleport' | 'take-actions',
): MonsterActionDraftRow {
  const id = createMonsterRowId()
  if (kind === 'leap') {
    return {
      id,
      kind: 'leap',
      name: getMonsterActionKindLabel('leap'),
      distanceFeet: LEAP_DISTANCE_DEFAULT,
      movementFeet: LEAP_MOVEMENT_DEFAULT,
    }
  }
  if (kind === 'teleport') {
    return {
      id,
      kind: 'teleport',
      name: getMonsterActionKindLabel('teleport'),
    } as MonsterActionDraftRow
  }
  return {
    id,
    kind: 'take-actions',
    standardActions: [],
    combination: 'one',
  } as MonsterActionDraftRow
}

export function createReactionActionDraft(
  category: 'reference' | 'parry' | 'cast-spell' | 'custom',
  sections: FormCastingSections,
): MonsterActionDraftRow {
  if (category === 'reference') {
    return {
      id: createMonsterRowId(),
      kind: 'action-reference',
      actionIds: [],
    }
  }
  if (category === 'parry') {
    return {
      id: createMonsterRowId(),
      kind: 'parry',
      name: getMonsterActionKindLabel('parry'),
      acBonus: PARRY_AC_BONUS_DEFAULT,
    }
  }
  if (category === 'cast-spell') {
    const cast = createSpellActionDraft('reactions', sections, 'standalone')
    if (cast.kind !== 'spell') return cast
    return { ...cast, name: MONSTER_CAST_SPELL_LABEL }
  }
  return { id: createMonsterRowId(), kind: 'special' }
}

function createSaveActionDraft(id: string): MonsterActionDraftRow {
  return {
    id,
    kind: 'save',
    resolution: {
      selectionMode: 'targets',
      target: { ...DEFAULT_RESOLUTION_TARGET },
      method: { kind: 'saving-throw' },
      effects: [],
      outcomes: [
        { result: 'failed-save', effects: [] },
        { result: 'successful-save', effects: [] },
      ],
    },
    // The saving-throw ability is chosen in the editor after the row is added.
  } as unknown as MonsterActionDraftRow
}

function createActionKindDraft(
  choice: Extract<
    MonsterActionAcquisitionChoice,
    { type: 'create'; kind: 'attack' | 'special' | 'save' | 'shape-shift' | 'spell' }
  >,
  id: string,
): MonsterActionDraftRow {
  if (choice.kind === 'spell') {
    return createSpellActionDraft('actions', {}, choice.spellAcquisition ?? 'standalone')
  }
  if (choice.kind === 'special') return { id, kind: 'special' } as MonsterActionDraftRow
  if (choice.kind === 'shape-shift') {
    return {
      id,
      kind: 'shape-shift',
      name: 'Shape-Shift',
      equipment: 'unchanged',
    } as MonsterActionDraftRow
  }
  if (choice.kind === 'save') return createSaveActionDraft(id)
  return { id, kind: 'attack', damage: authoredStartingDamage() } as MonsterActionDraftRow
}

export function createMonsterActionFromAcquisition(
  choice: Exclude<
    MonsterActionAcquisitionChoice,
    { type: 'add-weapon' } | { type: 'legendary' } | { type: 'reaction' }
  >,
): MonsterActionDraftRow {
  const id = createMonsterRowId()
  if (choice.type === 'weapon-entry') {
    return { id, kind: 'weapon', equipmentEntryId: choice.entryId } as MonsterActionDraftRow
  }
  if (choice.type === 'natural' || choice.type === 'preset') return draftFromPreset(choice.presetId)
  if (choice.type === 'other-natural') {
    return {
      id,
      kind: 'natural-weapon',
      mode: 'melee',
      damage: authoredStartingDamage(),
    } as MonsterActionDraftRow
  }
  if (choice.type === 'create') {
    if (choice.kind === 'leap' || choice.kind === 'teleport' || choice.kind === 'take-actions') {
      return createActionDraft(choice.kind)
    }
    if (choice.kind === 'spell') {
      return createSpellActionDraft('actions', {}, choice.spellAcquisition)
    }
    return createActionKindDraft(
      choice as Extract<
        MonsterActionAcquisitionChoice,
        { type: 'create'; kind: 'attack' | 'special' | 'save' | 'shape-shift' }
      >,
      id,
    )
  }
  const unreachable: never = choice
  throw new Error(`Unsupported monster action acquisition choice: ${JSON.stringify(unreachable)}`)
}

/** Spell row for the add menu. Primary profile only when spellAcquisition is primary. */
export function createSpellActionDraft(
  section: MonsterActionSection,
  sections: FormCastingSections,
  spellAcquisition: 'primary' | 'standalone' = 'standalone',
): MonsterActionDraftRow {
  const id = createMonsterRowId()
  void section
  if (spellAcquisition === 'primary') {
    return {
      id,
      kind: 'spell',
      profile: PRIMARY_SPELLCASTING_PROFILE,
      name: MONSTER_SPELLCASTING_ACTION_NAME,
      spells: [],
    } as MonsterActionDraftRow
  }
  const conventional = conventionalSpellcastingSources(sections)
  const castingAbility =
    conventional.length === 1
      ? { kind: 'shared' as const, entryId: conventional[0]!.id }
      : undefined
  return {
    id,
    kind: 'spell',
    spells: [],
    ...(castingAbility ? { castingAbility } : {}),
  } as MonsterActionDraftRow
}

/** Equipped catalog row and the weapon action that points at it. One commit, no orphan. */
export function createEquippedWeaponAcquisition(equipmentId: string): {
  entry: { entryId: string; equipmentId: string; quantity: 1; equipped: true }
  action: MonsterActionDraftRow
} {
  const entryId = createMonsterRowId()
  return {
    entry: { entryId, equipmentId, quantity: 1, equipped: true },
    action: { id: createMonsterRowId(), kind: 'weapon', equipmentEntryId: entryId },
  }
}
