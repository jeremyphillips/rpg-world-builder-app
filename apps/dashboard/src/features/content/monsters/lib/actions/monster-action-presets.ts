import type { z } from 'zod'
import type { monsterReactionDraftSchema, MonsterActionKind } from '@rpg/contracts'

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

export type MonsterActionPresetId = 'weapon' | 'special' | 'spell' | MonsterNaturalWeaponPresetId

type ReactionDraftInput = z.input<typeof monsterReactionDraftSchema>
type DraftVariant<K extends MonsterActionKind> = Partial<
  Omit<Extract<ReactionDraftInput, { kind: K }>, 'id' | 'kind'>
>

/**
 * Editor row. Fields come from the reaction draft schema, flattened so a row can
 * hold the active kind's values before normalization drops the rest.
 */
export type MonsterActionDraftRow = {
  id: string
  kind: MonsterActionKind
} & DraftVariant<'weapon'> &
  DraftVariant<'natural-weapon'> &
  DraftVariant<'special'> &
  DraftVariant<'spell'>

export function createMonsterRowId(): string {
  return crypto.randomUUID()
}

export function createActionFromPreset(presetId: MonsterActionPresetId): MonsterActionDraftRow {
  const id = createMonsterRowId()
  if (presetId === 'weapon') return { id, kind: 'weapon' }
  if (presetId === 'special') return { id, kind: 'special' }
  if (presetId === 'spell') return { id, kind: 'spell', spellGroups: [{ spellIds: [] }] }
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
