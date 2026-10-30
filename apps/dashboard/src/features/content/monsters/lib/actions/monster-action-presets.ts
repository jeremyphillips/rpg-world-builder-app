import type { MonsterActionKind } from '@rpg/contracts'

import type { MonsterActionSection } from './monster-action-equipment-references'

export const MONSTER_NATURAL_WEAPON_PRESETS = [
  { id: 'claw', name: 'Claw', damageType: 'slashing' },
  { id: 'bite', name: 'Bite', damageType: 'piercing' },
  { id: 'slam', name: 'Slam', damageType: 'bludgeoning' },
  { id: 'tail', name: 'Tail', damageType: 'bludgeoning' },
  { id: 'gore', name: 'Gore', damageType: 'piercing' },
  { id: 'sting', name: 'Sting', damageType: 'piercing' },
  { id: 'talons', name: 'Talons', damageType: 'slashing' },
  { id: 'tentacle', name: 'Tentacle', damageType: 'bludgeoning' },
] as const

export type MonsterNaturalWeaponPresetId = (typeof MONSTER_NATURAL_WEAPON_PRESETS)[number]['id']

export type MonsterActionPresetId = 'weapon' | 'special' | MonsterNaturalWeaponPresetId

export type MonsterActionDraftRow = {
  id: string
  kind: MonsterActionKind
  name?: string
  description?: string
  trigger?: { text: string }
  equipmentEntryId?: string
  mode?: 'melee' | 'ranged'
  properties?: string[]
  reach?: number
  range?: { normal?: number; long?: number }
  damage?: { dice?: { count?: number; faces?: number }; flat?: number }
  damageType?: string
}

export function createMonsterRowId(): string {
  return crypto.randomUUID()
}

export function createActionFromPreset(presetId: MonsterActionPresetId): MonsterActionDraftRow {
  const id = createMonsterRowId()
  if (presetId === 'weapon') return { id, kind: 'weapon' }
  if (presetId === 'special') return { id, kind: 'special' }
  const preset = MONSTER_NATURAL_WEAPON_PRESETS.find((entry) => entry.id === presetId)
  if (!preset) return { id, kind: 'special' }
  return {
    id,
    kind: 'natural-weapon',
    name: preset.name,
    damageType: preset.damageType,
    mode: 'melee',
  }
}

export function monsterActionSectionHeading(section: MonsterActionSection): string {
  if (section === 'bonusActions') return 'Bonus actions'
  if (section === 'reactions') return 'Reactions'
  return 'Actions'
}
