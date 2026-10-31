import type { PhysicalDamageType } from './damage/physical'
import { keysFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'
import type { WeaponMode } from './weapon/mode'

// ---------------------------------------------------------------------------
// Natural-weapon acquisition presets. Ids are not stored on monster actions.
// ---------------------------------------------------------------------------

export const MONSTER_NATURAL_WEAPON_PRESET_TERM = {
  label: 'Natural Weapon Preset',
  description: 'A starting name, damage type, and mode for a monster natural weapon action.',
  sentence: {
    singular: 'natural weapon preset',
    plural: 'natural weapon presets',
  },
} as const satisfies VocabularyTerm

export type MonsterNaturalWeaponPresetEntry = GameTermEntry & {
  readonly defaultDamageType: PhysicalDamageType
  readonly defaultMode: WeaponMode
}

export const MONSTER_NATURAL_WEAPON_PRESET_ENTRIES = {
  claw: {
    label: 'Claw',
    description: 'A slashing claw or similar edged natural attack.',
    defaultDamageType: 'slashing',
    defaultMode: 'melee',
  },
  bite: {
    label: 'Bite',
    description: 'A piercing bite.',
    defaultDamageType: 'piercing',
    defaultMode: 'melee',
  },
  slam: {
    label: 'Slam',
    description: 'A bludgeoning slam.',
    defaultDamageType: 'bludgeoning',
    defaultMode: 'melee',
  },
  tail: {
    label: 'Tail',
    description: 'A bludgeoning tail attack.',
    defaultDamageType: 'bludgeoning',
    defaultMode: 'melee',
  },
  gore: {
    label: 'Gore',
    description: 'A piercing gore with horns or tusks.',
    defaultDamageType: 'piercing',
    defaultMode: 'melee',
  },
  sting: {
    label: 'Sting',
    description: 'A piercing sting.',
    defaultDamageType: 'piercing',
    defaultMode: 'melee',
  },
  talons: {
    label: 'Talons',
    description: 'A slashing talon attack.',
    defaultDamageType: 'slashing',
    defaultMode: 'melee',
  },
  tentacle: {
    label: 'Tentacle',
    description: 'A bludgeoning tentacle attack.',
    defaultDamageType: 'bludgeoning',
    defaultMode: 'melee',
  },
} as const satisfies Record<string, MonsterNaturalWeaponPresetEntry>

export type MonsterNaturalWeaponPresetId = keyof typeof MONSTER_NATURAL_WEAPON_PRESET_ENTRIES

export const MONSTER_NATURAL_WEAPON_PRESET_IDS = keysFromEntries(
  MONSTER_NATURAL_WEAPON_PRESET_ENTRIES,
)

export function getMonsterNaturalWeaponPreset(
  id: string,
): MonsterNaturalWeaponPresetEntry | undefined {
  return MONSTER_NATURAL_WEAPON_PRESET_ENTRIES[id as MonsterNaturalWeaponPresetId]
}
