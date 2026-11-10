import {
  ACTION_PRESET_IDS,
  getActionPreset,
  getActionVocabularyEntry,
  getDamageTypeLabel,
  getMonsterActionKindLabel,
  listSpecialMenuActionPresetIds,
  MONSTER_SPELLCASTING_ACTION_NAME,
  type ActionPresetId,
} from '@rpg/contracts'

import {
  conventionalSpellcastingSources,
  spellcastingNameTaken,
} from './monster-action-casting-summary'
import type { MonsterActionSection } from './monster-action-equipment-references'

import {
  MONSTER_ACQUISITION_ATTACK_DESCRIPTION,
  MONSTER_ACQUISITION_SAVE_DESCRIPTION,
  MONSTER_ACQUISITION_MULTIATTACK_DESCRIPTION,
  MONSTER_ACQUISITION_SPELL_DESCRIPTION,
  MONSTER_ACQUISITION_SPECIAL_DESCRIPTION,
  monsterAddWeaponShortcut,
} from '../monster-form-labels'
import { createMonsterRowId, type MonsterActionDraftRow } from './monster-action-presets'

export const MONSTER_ACTION_ACQUISITION_GROUPS = [
  { id: 'equipped', label: 'Equipped weapons' },
  { id: 'natural', label: 'Natural attacks' },
  { id: 'special', label: 'Special actions' },
  { id: 'other', label: 'General' },
] as const

export type MonsterActionAcquisitionGroupId =
  (typeof MONSTER_ACTION_ACQUISITION_GROUPS)[number]['id']

export type MonsterActionAcquisitionItem = {
  id: string
  label: string
  groupId: MonsterActionAcquisitionGroupId
  metadata?: string
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
  | { type: 'create'; kind: 'attack' | 'spell' | 'special' | 'save' }

const SPECIAL_MENU_ORDER = ['multiattack', 'constrict', 'breath-weapon'] as const

const OTHER_ITEMS: readonly MonsterActionAcquisitionItem[] = [
  {
    id: 'create:attack',
    label: 'Attack',
    groupId: 'other',
    metadata: MONSTER_ACQUISITION_ATTACK_DESCRIPTION,
  },
  {
    id: 'create:spell',
    label: 'Spellcasting',
    groupId: 'other',
    metadata: MONSTER_ACQUISITION_SPELL_DESCRIPTION,
  },
  {
    id: 'create:special',
    label: 'Special ability',
    groupId: 'other',
    metadata: MONSTER_ACQUISITION_SPECIAL_DESCRIPTION,
  },
  {
    id: 'create:save',
    label: getMonsterActionKindLabel('save'),
    groupId: 'other',
    metadata: MONSTER_ACQUISITION_SAVE_DESCRIPTION,
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
  'create:spell': { type: 'create', kind: 'spell' },
  'create:special': { type: 'create', kind: 'special' },
  'create:save': { type: 'create', kind: 'save' },
  'natural:other': { type: 'other-natural' },
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
  if (prefix !== 'preset') return undefined
  const preset = getActionPreset(value)
  if (!preset || preset.mechanics === 'attack-roll') return undefined
  return { type: 'preset', presetId: value as ActionPresetId }
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
}): MonsterActionAcquisitionItem[] {
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
    }
  })
  const special = listSpecialMenuActionPresetIds()
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
        ...(presetId === 'multiattack'
          ? { metadata: MONSTER_ACQUISITION_MULTIATTACK_DESCRIPTION }
          : {}),
      }
    })
  return [
    ...equipped,
    {
      id: 'add-weapon',
      label: monsterAddWeaponShortcut(),
      groupId: 'equipped',
      disabled: !input.allowAddWeapon,
      note: input.allowAddWeapon ? undefined : 'Equipment catalog is not ready',
    },
    ...natural,
    {
      id: 'natural:other',
      label: 'Other natural attack',
      groupId: 'natural',
    },
    ...special,
    ...OTHER_ITEMS,
  ]
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

export function createMonsterActionFromAcquisition(
  choice: Exclude<MonsterActionAcquisitionChoice, { type: 'add-weapon' }>,
): MonsterActionDraftRow {
  const id = createMonsterRowId()
  if (choice.type === 'weapon-entry') {
    return { id, kind: 'weapon', equipmentEntryId: choice.entryId }
  }
  if (choice.type === 'natural' || choice.type === 'preset') return draftFromPreset(choice.presetId)
  if (choice.type === 'other-natural') {
    return { id, kind: 'natural-weapon', mode: 'melee', reach: 5 }
  }
  if (choice.kind === 'spell') return { id, kind: 'spell', spells: [] }
  if (choice.kind === 'special') return { id, kind: 'special' }
  if (choice.kind === 'save') return { id, kind: 'save' }
  return { id, kind: 'attack' }
}

/** Spell row for the add menu. Names Spellcasting only on Actions, and shares only that source. */
export function createSpellActionDraft(
  section: MonsterActionSection,
  sections: {
    actions?: readonly unknown[]
    bonusActions?: readonly unknown[]
    reactions?: readonly unknown[]
  },
): MonsterActionDraftRow {
  const id = createMonsterRowId()
  const conventional = conventionalSpellcastingSources(sections)
  const name =
    section === 'actions' && !spellcastingNameTaken(sections)
      ? MONSTER_SPELLCASTING_ACTION_NAME
      : undefined
  const castingAbility =
    conventional.length === 1
      ? { kind: 'shared' as const, entryId: conventional[0]!.id }
      : undefined
  return {
    id,
    kind: 'spell',
    spells: [],
    ...(name ? { name } : {}),
    ...(castingAbility ? { castingAbility } : {}),
  }
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
