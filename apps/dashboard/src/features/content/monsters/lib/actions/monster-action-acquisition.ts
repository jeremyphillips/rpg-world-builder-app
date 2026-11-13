import {
  ACTION_PRESET_IDS,
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
  PRIMARY_SPELLCASTING_DUPLICATE_MESSAGE,
  PRIMARY_SPELLCASTING_PROFILE,
  monsterSectionAllowsPreset,
  type ActionPresetId,
} from '@rpg/contracts'
import { conventionalSpellcastingSources } from './monster-action-casting-summary'
import type { MonsterActionSection } from './monster-action-equipment-references'

import {
  MONSTER_ACQUISITION_ATTACK_DESCRIPTION,
  MONSTER_ACQUISITION_MULTIATTACK_DESCRIPTION,
  MONSTER_ACQUISITION_SAVE_DESCRIPTION,
  MONSTER_ACQUISITION_SPELL_PRIMARY_DESCRIPTION,
  MONSTER_ACQUISITION_SPELL_STANDALONE_DESCRIPTION,
  MONSTER_CAST_SPELL_LABEL,
  MONSTER_ACQUISITION_SPECIAL_DESCRIPTION,
  MONSTER_LEAP_DESCRIPTION,
  MONSTER_PARRY_DESCRIPTION,
  MONSTER_TAKE_ACTIONS_DESCRIPTION,
  MONSTER_TELEPORT_DESCRIPTION,
  MONSTER_REACTION_CAST_SPELL_DESCRIPTION,
  MONSTER_REACTION_CUSTOM_DESCRIPTION,
  MONSTER_REACTION_CUSTOM_LABEL,
  MONSTER_ACTION_REFERENCE_ACQUISITION_LABEL,
  LEGENDARY_CAST_SPELL_DISABLED_NOTE,
  LEGENDARY_REFERENCE_DESCRIPTION,
  LEGENDARY_REFERENCE_DISABLED_NOTE,
  monsterAddWeaponShortcut,
} from '../monster-form-labels'
import { createMonsterRowId } from '../monster-row-id'
import type { MonsterActionDraftRow } from './monster-action-presets'

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

export type MonsterActionAcquisitionItem = {
  id: string
  label: string
  groupId: MonsterActionAcquisitionGroupId
  metadata?: string
  search?: { includeSupporting?: boolean }
  searchTerms?: readonly string[]
  disabled?: boolean
  note?: string
}

export type MonsterActionAcquisitionChoice =
  | { type: 'weapon-entry'; entryId: string }
  | { type: 'focus-existing'; actionId: string }
  | { type: 'add-weapon' }
  | { type: 'natural'; presetId: ActionPresetId }
  | { type: 'other-natural' }
  | { type: 'preset'; presetId: ActionPresetId }
  | { type: 'create'; kind: 'attack' | 'special' | 'save' }
  | { type: 'create'; kind: 'spell'; spellAcquisition: 'primary' | 'standalone' }
  | { type: 'legendary'; category: 'reference' | 'spellcasting' | 'cast-spell' }
  | { type: 'reaction'; category: 'reference' | 'parry' | 'cast-spell' | 'custom' }
  | { type: 'bonus'; category: 'leap' | 'teleport' | 'take-actions' }

const SPECIAL_MENU_ORDER = ['multiattack', 'constrict', 'breath-weapon'] as const

const OTHER_ITEMS: readonly MonsterActionAcquisitionItem[] = [
  {
    id: 'create:attack',
    label: 'Attack roll',
    groupId: 'other',
    metadata: MONSTER_ACQUISITION_ATTACK_DESCRIPTION,
  },
  {
    id: 'create:spell',
    label: MONSTER_SPELLCASTING_ACTION_NAME,
    groupId: 'other',
    metadata: MONSTER_ACQUISITION_SPELL_PRIMARY_DESCRIPTION,
  },
  {
    id: 'create:spell-standalone',
    label: MONSTER_CAST_SPELL_LABEL,
    groupId: 'other',
    metadata: MONSTER_ACQUISITION_SPELL_STANDALONE_DESCRIPTION,
  },
  {
    id: 'create:special',
    label: 'Custom ability',
    groupId: 'other',
    metadata: MONSTER_ACQUISITION_SPECIAL_DESCRIPTION,
  },
]

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
  'natural:other': { type: 'other-natural' },
  'reaction:reference': { type: 'reaction', category: 'reference' },
  'reaction:parry': { type: 'reaction', category: 'parry' },
  'reaction:cast-spell': { type: 'reaction', category: 'cast-spell' },
  'reaction:custom': { type: 'reaction', category: 'custom' },
  'bonus:leap': { type: 'bonus', category: 'leap' },
  'bonus:teleport': { type: 'bonus', category: 'teleport' },
  'bonus:take-actions': { type: 'bonus', category: 'take-actions' },
}

function legendaryAcquisitionChoice(value: string): MonsterActionAcquisitionChoice | undefined {
  if (value === 'reference' || value === 'spellcasting' || value === 'cast-spell') {
    return { type: 'legendary', category: value }
  }
  return undefined
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
  if (prefix === 'focus-action') return { type: 'focus-existing', actionId: value }
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

export const MONSTER_ACTION_ALREADY_ADDED_NOTE = 'Already added'

export function monsterActionAcquisitionItems(input: {
  weapons: readonly { entryId: string; label: string; equipped: boolean }[]
  allowAddWeapon: boolean
  /** Weapon actions in section order. The first match is the row Already added opens. */
  weaponActions?: readonly { id: string; equipmentEntryId?: string }[]
  section?: MonsterActionSection
  /** True when the monster already has its Actions Spellcasting profile. */
  primarySpellcasting?: boolean
  /** Actions rows a reaction reference can use. */
  hasReferenceTargets?: boolean
  spellCatalogReady?: boolean
}): MonsterActionAcquisitionItem[] {
  if (input.section === 'reactions') {
    return reactionAcquisitionItems(
      input.hasReferenceTargets === true,
      input.spellCatalogReady !== false,
    )
  }
  const bonusMovement =
    input.section === 'bonusActions'
      ? [
          {
            id: 'bonus:leap',
            label: getMonsterActionKindLabel('leap'),
            groupId: 'movement' as const,
            metadata: MONSTER_LEAP_DESCRIPTION,
          },
          {
            id: 'bonus:teleport',
            label: getMonsterActionKindLabel('teleport'),
            groupId: 'movement' as const,
            metadata: MONSTER_TELEPORT_DESCRIPTION,
          },
        ]
      : []
  const equipped = input.weapons.map((weapon) => {
    const existing = input.weaponActions?.find(
      (action) => action.equipmentEntryId === weapon.entryId,
    )
    if (existing) {
      return {
        id: `focus-action:${existing.id}`,
        label: weapon.label,
        groupId: 'equipped' as const,
        note: MONSTER_ACTION_ALREADY_ADDED_NOTE,
      }
    }
    return {
      id: `weapon-entry:${weapon.entryId}`,
      label: weapon.label,
      groupId: 'equipped' as const,
      disabled: !weapon.equipped,
      note: weapon.equipped ? undefined : 'Not equipped',
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
      metadata: damageType ? getDamageTypeLabel(damageType) : undefined,
      search: { includeSupporting: false as const },
      searchTerms: preset ? getActionVocabularySearchTerms(preset.vocabularyId) : [],
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
        search: { includeSupporting: false as const },
        searchTerms: preset ? getActionVocabularySearchTerms(preset.vocabularyId) : [],
        ...(presetId === 'multiattack'
          ? { metadata: MONSTER_ACQUISITION_MULTIATTACK_DESCRIPTION }
          : {}),
      }
    })
  const weaponsAllowed = input.section === undefined || input.section === 'actions'
  return [
    ...(weaponsAllowed
      ? [
          ...equipped,
          {
            id: 'add-weapon',
            label: monsterAddWeaponShortcut(),
            groupId: 'equipped' as const,
            disabled: !input.allowAddWeapon,
            note: input.allowAddWeapon ? undefined : 'Equipment catalog is not ready',
          },
          ...natural,
          {
            id: 'natural:other',
            label: 'Other natural attack',
            groupId: 'natural' as const,
          },
        ]
      : []),
    ...special,
    ...bonusMovement,
    ...generalAcquisitionItems(input.section, input.primarySpellcasting === true),
  ]
}

function reactionAcquisitionItems(
  hasReferenceTargets: boolean,
  spellCatalogReady: boolean,
): MonsterActionAcquisitionItem[] {
  return [
    {
      id: 'reaction:reference',
      label: MONSTER_ACTION_REFERENCE_ACQUISITION_LABEL,
      groupId: 'existing',
      metadata: LEGENDARY_REFERENCE_DESCRIPTION,
      disabled: !hasReferenceTargets,
      note: hasReferenceTargets ? undefined : LEGENDARY_REFERENCE_DISABLED_NOTE,
    },
    {
      id: 'reaction:parry',
      label: getMonsterActionKindLabel('parry'),
      groupId: 'new',
      metadata: MONSTER_PARRY_DESCRIPTION,
    },
    {
      id: 'reaction:cast-spell',
      label: MONSTER_CAST_SPELL_LABEL,
      groupId: 'new',
      metadata: MONSTER_REACTION_CAST_SPELL_DESCRIPTION,
      disabled: !spellCatalogReady,
      note: spellCatalogReady ? undefined : LEGENDARY_CAST_SPELL_DISABLED_NOTE,
    },
    {
      id: 'reaction:custom',
      label: MONSTER_REACTION_CUSTOM_LABEL,
      groupId: 'new',
      metadata: MONSTER_REACTION_CUSTOM_DESCRIPTION,
    },
  ]
}

function generalAcquisitionItems(
  section: MonsterActionSection | undefined,
  primarySpellcasting: boolean,
): MonsterActionAcquisitionItem[] {
  const standalone = OTHER_ITEMS.filter((item) => item.id === 'create:spell-standalone')
  const rest = OTHER_ITEMS.filter(
    (item) => item.id !== 'create:spell' && item.id !== 'create:spell-standalone',
  )
  const spellcasting = OTHER_ITEMS.find((item) => item.id === 'create:spell')
  const saveItem: MonsterActionAcquisitionItem = {
    id: 'create:save',
    label: 'Saving throw',
    groupId: 'other',
    metadata: MONSTER_ACQUISITION_SAVE_DESCRIPTION,
  }
  if (section === 'bonusActions') {
    return [
      {
        id: 'bonus:take-actions',
        label: getMonsterActionKindLabel('take-actions'),
        groupId: 'other' as const,
        metadata: MONSTER_TAKE_ACTIONS_DESCRIPTION,
      },
      ...rest,
      saveItem,
      ...standalone,
    ]
  }
  if (section === 'reactions') return []
  return [
    ...rest,
    ...(spellcasting
      ? [
          {
            ...spellcasting,
            ...(primarySpellcasting
              ? { disabled: true, note: PRIMARY_SPELLCASTING_DUPLICATE_MESSAGE }
              : {}),
          },
        ]
      : []),
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
  if (!preset) return { id, kind: 'special' }
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

export function createBonusActionDraft(
  category: 'leap' | 'teleport' | 'take-actions',
): MonsterActionDraftRow {
  const id = createMonsterRowId()
  if (category === 'leap') {
    return {
      id,
      kind: 'leap',
      name: getMonsterActionKindLabel('leap'),
      distanceFeet: LEAP_DISTANCE_DEFAULT,
      movementFeet: LEAP_MOVEMENT_DEFAULT,
    }
  }
  if (category === 'teleport') {
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
  sections: {
    actions?: readonly unknown[]
    bonusActions?: readonly unknown[]
    reactions?: readonly unknown[]
    legendaryActions?: readonly unknown[]
  },
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

export function createMonsterActionFromAcquisition(
  choice: Exclude<
    MonsterActionAcquisitionChoice,
    { type: 'add-weapon' } | { type: 'legendary' } | { type: 'reaction' } | { type: 'bonus' }
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
  if (choice.type === 'focus-existing') {
    throw new Error('focus-existing is not a create choice')
  }
  if (choice.type === 'create') {
    if (choice.kind === 'spell') {
      const spellAcquisition = choice.spellAcquisition ?? 'standalone'
      return createSpellActionDraft('actions', {}, spellAcquisition)
    }
    if (choice.kind === 'special') return { id, kind: 'special' } as MonsterActionDraftRow
    if (choice.kind === 'save') return { id, kind: 'save' } as MonsterActionDraftRow
    return { id, kind: 'attack', damage: authoredStartingDamage() } as MonsterActionDraftRow
  }
  return { id, kind: 'special' } as MonsterActionDraftRow
}

/** Spell row for the add menu. Primary profile only when spellAcquisition is primary. */
export function createSpellActionDraft(
  section: MonsterActionSection,
  sections: {
    actions?: readonly unknown[]
    bonusActions?: readonly unknown[]
    reactions?: readonly unknown[]
    legendaryActions?: readonly unknown[]
  },
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
