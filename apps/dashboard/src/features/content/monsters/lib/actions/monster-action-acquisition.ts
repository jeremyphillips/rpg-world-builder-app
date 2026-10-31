import {
  getDamageTypeLabel,
  getMonsterActionKindLabel,
  getMonsterNaturalWeaponPreset,
  MONSTER_NATURAL_WEAPON_PRESET_DEFAULT_DAMAGE,
  MONSTER_NATURAL_WEAPON_PRESET_IDS,
  type MonsterNaturalWeaponPresetId,
} from '@rpg/contracts'

import { monsterAddWeaponShortcut } from '../monster-form-labels'
import { createMonsterRowId, type MonsterActionDraftRow } from './monster-action-presets'

export const MONSTER_ACTION_ACQUISITION_GROUPS = [
  { id: 'equipped', label: 'Equipped weapons' },
  { id: 'natural', label: 'Natural attacks' },
  { id: 'create', label: 'Create' },
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
  | { type: 'natural'; presetId: MonsterNaturalWeaponPresetId }
  | { type: 'create'; kind: 'attack' | 'spell' | 'special' | 'natural' }

const CREATE_ITEMS: readonly MonsterActionAcquisitionItem[] = [
  {
    id: 'create:attack',
    label: 'Custom attack',
    groupId: 'create',
    metadata: getMonsterActionKindLabel('attack'),
  },
  {
    id: 'create:spell',
    label: 'Spellcasting',
    groupId: 'create',
    metadata: getMonsterActionKindLabel('spell'),
  },
  {
    id: 'create:special',
    label: 'Special ability',
    groupId: 'create',
    metadata: getMonsterActionKindLabel('special'),
  },
  {
    id: 'create:natural',
    label: 'Custom natural attack',
    groupId: 'create',
    metadata: getMonsterActionKindLabel('natural-weapon'),
  },
]

export function parseMonsterActionAcquisitionId(
  id: string,
): MonsterActionAcquisitionChoice | undefined {
  if (id === 'add-weapon') return { type: 'add-weapon' }
  if (id === 'create:attack') return { type: 'create', kind: 'attack' }
  if (id === 'create:spell') return { type: 'create', kind: 'spell' }
  if (id === 'create:special') return { type: 'create', kind: 'special' }
  if (id === 'create:natural') return { type: 'create', kind: 'natural' }
  if (id.startsWith('weapon-entry:')) {
    const entryId = id.slice('weapon-entry:'.length)
    return entryId ? { type: 'weapon-entry', entryId } : undefined
  }
  if (id.startsWith('natural:')) {
    const presetId = id.slice('natural:'.length)
    if (!getMonsterNaturalWeaponPreset(presetId)) return undefined
    return { type: 'natural', presetId: presetId as MonsterNaturalWeaponPresetId }
  }
  return undefined
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
  const natural = MONSTER_NATURAL_WEAPON_PRESET_IDS.map((presetId) => {
    const preset = getMonsterNaturalWeaponPreset(presetId)
    return {
      id: `natural:${presetId}`,
      label: preset?.label ?? presetId,
      groupId: 'natural' as const,
      metadata: preset ? getDamageTypeLabel(preset.defaultDamageType) : undefined,
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
    ...CREATE_ITEMS,
  ]
}

export function createMonsterActionFromAcquisition(
  choice: Exclude<MonsterActionAcquisitionChoice, { type: 'add-weapon' }>,
): MonsterActionDraftRow {
  const id = createMonsterRowId()
  if (choice.type === 'weapon-entry') {
    return { id, kind: 'weapon', equipmentEntryId: choice.entryId }
  }
  if (choice.type === 'natural') {
    const preset = getMonsterNaturalWeaponPreset(choice.presetId)
    return {
      id,
      kind: 'natural-weapon',
      name: preset?.label ?? choice.presetId,
      damageType: preset?.defaultDamageType,
      mode: preset?.defaultMode ?? 'melee',
      damage: { ...MONSTER_NATURAL_WEAPON_PRESET_DEFAULT_DAMAGE },
    }
  }
  if (choice.kind === 'spell') return { id, kind: 'spell', spells: [] }
  if (choice.kind === 'special') return { id, kind: 'special' }
  if (choice.kind === 'natural') return { id, kind: 'natural-weapon', mode: 'melee' }
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
