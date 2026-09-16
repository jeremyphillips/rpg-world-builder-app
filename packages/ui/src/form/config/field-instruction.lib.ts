import { choiceCountPhrase } from '@rpg/contracts'

import type { FieldCopyContext } from './field-copy-context.lib'

/** Constraint-based helper text for multi-select choice fields. */
export function resolveFieldInstruction(context: FieldCopyContext): string | undefined {
  if (context.category !== 'multi') return undefined
  if (context.min === undefined && context.max === undefined) return undefined

  return choiceCountPhrase(context.noun, {
    min: context.min,
    max: context.max,
  })
}
