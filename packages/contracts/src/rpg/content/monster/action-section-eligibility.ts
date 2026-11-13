import { getActionPreset } from '../action/action-presets'
import type { MonsterActionSection } from './action-sections'

/** Kinds a section may store. Menus and Move to read this list. */
export const MONSTER_SECTION_KINDS = {
  actions: ['weapon', 'natural-weapon', 'attack', 'save', 'spell', 'special', 'multiattack'],
  bonusActions: ['attack', 'save', 'spell', 'special', 'leap', 'teleport', 'take-actions'],
  reactions: ['parry', 'action-reference', 'spell', 'special'],
  legendaryActions: ['action-reference', 'spell', 'special'],
} as const satisfies Record<MonsterActionSection, readonly string[]>

/** Named presets that belong on Actions. A shared `save` kind does not move them. */
export const ACTIONS_ONLY_PRESET_IDS = ['breath-weapon', 'constrict', 'multiattack'] as const

export function monsterSectionAllowsKind(section: MonsterActionSection, kind: string): boolean {
  return (MONSTER_SECTION_KINDS[section] as readonly string[]).includes(kind)
}

export function monsterSectionAllowsPreset(
  section: MonsterActionSection,
  presetId: string,
): boolean {
  if (section === 'reactions' || section === 'legendaryActions') return false
  if (section === 'actions') return true
  if ((ACTIONS_ONLY_PRESET_IDS as readonly string[]).includes(presetId)) return false
  return getActionPreset(presetId)?.mechanics !== 'attack-roll'
}
