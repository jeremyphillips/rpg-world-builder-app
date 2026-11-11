import {
  isPrimarySpellcastingAction,
  monsterActionDraftSchema,
  monsterLegendaryActionDraftSchema,
  monsterReactionDraftSchema,
} from '@rpg/contracts'

import type { MonsterActionSection } from './monster-action-equipment-references'
import type { MonsterActionDraftRow } from './monster-action-presets'

function variantKeys(schema: object, kind: string): readonly string[] {
  const options = (schema as { options?: readonly { shape: { kind: { value?: unknown } } }[] })
    .options
  const option = options?.find((entry) => entry.shape.kind.value === kind)
  if (!option) return []
  return Object.keys(option.shape)
}

/** Active-kind keys from the draft variant, including `trigger` on reactions. */
export function monsterActionActiveKeys(
  kind: string,
  section: MonsterActionSection,
): readonly string[] {
  const schema =
    section === 'reactions'
      ? monsterReactionDraftSchema
      : section === 'legendaryActions'
        ? monsterLegendaryActionDraftSchema
        : monsterActionDraftSchema
  return variantKeys(schema, kind)
}

/** Authored reaction trigger prose, or undefined when the field is blank. */
export function monsterActionTriggerText(trigger: unknown): string | undefined {
  if (typeof trigger === 'string') {
    const text = trigger.trim()
    return text.length > 0 ? text : undefined
  }
  if (typeof trigger === 'object' && trigger !== null && 'text' in trigger) {
    const text = trigger.text
    if (typeof text !== 'string') return undefined
    const trimmed = text.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }
  return undefined
}

export function actionMoveDropsTrigger(
  action: MonsterActionDraftRow,
  from: MonsterActionSection,
  to: MonsterActionSection,
): boolean {
  return (
    from === 'reactions' &&
    to !== 'reactions' &&
    monsterActionTriggerText('trigger' in action ? action.trigger : undefined) !== undefined
  )
}

/** Whether Move to may place this row in `to`. Primary Spellcasting stays in Actions. */
export function monsterActionSectionMoveAllowed(
  action: { kind?: string; profile?: string },
  from: MonsterActionSection,
  to: MonsterActionSection,
): boolean {
  if (from === to) return false
  if (from === 'legendaryActions' || to === 'legendaryActions') return false
  if (action.kind === 'multiattack' && to !== 'actions') return false
  if (isPrimarySpellcastingAction(action) && to !== 'actions') return false
  return true
}

export function actionAfterSectionMove(
  action: MonsterActionDraftRow,
  to: MonsterActionSection,
): MonsterActionDraftRow {
  if (to === 'reactions') return action
  if (!('trigger' in action)) return action
  const { trigger: _trigger, ...rest } = action
  return rest as MonsterActionDraftRow
}
