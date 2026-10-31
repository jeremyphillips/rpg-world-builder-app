import { monsterActionDraftSchema, monsterReactionDraftSchema } from '@rpg/contracts'

import type { MonsterActionSection } from './monster-action-equipment-references'
import type { MonsterActionDraftRow } from './monster-action-presets'

type DraftUnion = typeof monsterActionDraftSchema

function variantKeys(schema: DraftUnion, kind: string): readonly string[] {
  const option = schema.options.find((entry) => {
    const discriminator = entry.shape.kind
    return 'value' in discriminator && discriminator.value === kind
  })
  if (!option) return []
  return Object.keys(option.shape)
}

/** Active-kind keys from the draft variant, including `trigger` on reactions. */
export function monsterActionActiveKeys(
  kind: string,
  section: MonsterActionSection,
): readonly string[] {
  const schema = section === 'reactions' ? monsterReactionDraftSchema : monsterActionDraftSchema
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
    monsterActionTriggerText(action.trigger) !== undefined
  )
}

export function actionAfterSectionMove(
  action: MonsterActionDraftRow,
  to: MonsterActionSection,
): MonsterActionDraftRow {
  if (to === 'reactions') return action
  const { trigger: _trigger, ...rest } = action
  return rest
}
