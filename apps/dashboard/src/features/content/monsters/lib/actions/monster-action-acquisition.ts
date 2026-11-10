import {
  ACTION_PRESET_IDS,
  getActionPreset,
  getActionVocabularyEntry,
  getDamageTypeLabel,
  getMonsterActionKindLabel,
  listSpecialMenuActionPresetIds,
  type ActionPresetId,
} from '@rpg/contracts'

import { monsterAddWeaponShortcut } from '../monster-form-labels'
import { createMonsterRowId } from '../monster-row-id'
import type { MonsterActionDraftRow } from './monster-action-presets'

export const MONSTER_ACTION_ACQUISITION_GROUPS = [
  { id: 'equipped', label: 'Equipped weapons' },
  { id: 'natural', label: 'Natural attacks' },
  { id: 'special', label: 'Special actions' },
  { id: 'other', label: 'Other' },
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
  | { type: 'add-weapon' }
  | { type: 'natural'; presetId: ActionPresetId }
  | { type: 'other-natural' }
  | { type: 'preset'; presetId: ActionPresetId }
  | { type: 'create'; kind: 'attack' | 'spell' | 'special' }

const OTHER_ITEMS: readonly MonsterActionAcquisitionItem[] = [
  {
    id: 'create:attack',
    label: 'Attack',
    groupId: 'other',
    metadata: getMonsterActionKindLabel('attack'),
  },
  {
    id: 'create:spell',
    label: 'Spellcasting',
    groupId: 'other',
    metadata: getMonsterActionKindLabel('spell'),
  },
  {
    id: 'create:special',
    label: 'Special ability',
    groupId: 'other',
    metadata: getMonsterActionKindLabel('special'),
  },
]

function isAttackRollPreset(id: ActionPresetId): boolean {
  return getActionPreset(id)?.mechanics === 'attack-roll'
}

const EXACT_ACQUISITION_CHOICES: Record<string, MonsterActionAcquisitionChoice> = {
  'add-weapon': { type: 'add-weapon' },
  'create:attack': { type: 'create', kind: 'attack' },
  'create:spell': { type: 'create', kind: 'spell' },
  'create:special': { type: 'create', kind: 'special' },
  'natural:other': { type: 'other-natural' },
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

export function monsterActionAcquisitionItems(input: {
  weapons: readonly { entryId: string; label: string; equipped: boolean }[]
  allowAddWeapon: boolean
}): MonsterActionAcquisitionItem[] {
  const equipped = input.weapons.map((weapon) => ({
    id: `weapon-entry:${weapon.entryId}`,
    label: weapon.label,
    groupId: 'equipped' as const,
    disabled: !weapon.equipped,
    note: weapon.equipped ? undefined : 'Not equipped',
  }))
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
  const special = listSpecialMenuActionPresetIds().map((presetId) => {
    const preset = getActionPreset(presetId)
    const vocabulary = preset ? getActionVocabularyEntry(preset.vocabularyId) : undefined
    return {
      id: `preset:${presetId}`,
      label: vocabulary?.label ?? presetId,
      groupId: 'special' as const,
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
      metadata: getMonsterActionKindLabel('natural-weapon'),
    },
    ...special,
    ...OTHER_ITEMS,
  ]
}

function draftFromPreset(presetId: ActionPresetId): MonsterActionDraftRow {
  const preset = getActionPreset(presetId)
  const id = createMonsterRowId()
  const vocabulary = preset ? getActionVocabularyEntry(preset.vocabularyId) : undefined
  if (!preset) return { id, kind: 'special', name: presetId }
  if (preset.mechanics === 'attack-roll') {
    return {
      id,
      kind: 'natural-weapon',
      preset: presetId,
      name: vocabulary?.label ?? presetId,
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
      name: preset.defaults.suggestedName,
      dcSource: preset.defaults.dcSource,
      resolution: preset.defaults.resolution,
      ...(preset.defaults.limitedUse ? { limitedUse: preset.defaults.limitedUse } : {}),
    }
  }
  return {
    id,
    kind: 'multiattack',
    preset: presetId,
    name: vocabulary?.label ?? presetId,
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
  return { id, kind: 'attack' }
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
