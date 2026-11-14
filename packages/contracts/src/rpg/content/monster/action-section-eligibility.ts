import { getActionPreset } from '../action/action-presets'
import { isPrimarySpellcastingAction } from './spell-casting-source'
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

export type MonsterActionSectionMoveEligibilityReason =
  | 'same-section'
  | 'legendary'
  | 'kind'
  | 'primary-spellcasting'

export type MonsterActionSectionMoveEligibility = {
  allowed: boolean
  reason?: MonsterActionSectionMoveEligibilityReason
}

/** Whether an authored row may move to `to` without violating section/kind rules. */
export function monsterActionSectionMoveEligibility(
  action: { kind?: string; profile?: string },
  from: MonsterActionSection,
  to: MonsterActionSection,
): MonsterActionSectionMoveEligibility {
  if (from === to) return { allowed: false, reason: 'same-section' }
  if (from === 'legendaryActions' || to === 'legendaryActions') {
    return { allowed: false, reason: 'legendary' }
  }
  if (!action.kind || !monsterSectionAllowsKind(to, action.kind)) {
    return { allowed: false, reason: 'kind' }
  }
  if (isPrimarySpellcastingAction(action) && to !== 'actions') {
    return { allowed: false, reason: 'primary-spellcasting' }
  }
  return { allowed: true }
}

export type MonsterActionSectionMoveDataLoss = {
  dropsTrigger: boolean
}

function reactionTriggerDefined(trigger: unknown): boolean {
  if (typeof trigger === 'string') {
    return trigger.trim().length > 0
  }
  if (typeof trigger === 'object' && trigger !== null && 'text' in trigger) {
    const text = (trigger as { text?: unknown }).text
    return typeof text === 'string' && text.trim().length > 0
  }
  return false
}

/** Pure flags for authored state lost when moving between sections. */
export function monsterActionMoveDataLoss(
  action: { trigger?: unknown },
  from: MonsterActionSection,
  to: MonsterActionSection,
): MonsterActionSectionMoveDataLoss {
  return {
    dropsTrigger:
      from === 'reactions' && to !== 'reactions' && reactionTriggerDefined(action.trigger),
  }
}
