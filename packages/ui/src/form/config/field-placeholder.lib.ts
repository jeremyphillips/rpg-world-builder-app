import { resolveChoicePlaceholder, type FieldNoun } from '@rpg/contracts'

import type { FieldMessageCategory } from './field-error-map-category.lib'

export type FieldPlaceholderInput = {
  label: string
  noun?: FieldNoun
  category: FieldMessageCategory
}

/** Default closed-state placeholder for choice fields when config omits one. */
export function resolveFieldPlaceholder(
  input: FieldPlaceholderInput,
  placeholder?: string,
): string | undefined {
  if (placeholder !== undefined) return placeholder
  if (input.category !== 'choice' && input.category !== 'multi') return undefined

  const noun = input.noun ?? { singular: input.label, plural: input.label }
  return resolveChoicePlaceholder(noun, input.category === 'multi')
}

/** @deprecated Use {@link resolveFieldPlaceholder} with a copy context instead. */
export function resolveSelectPlaceholder(label: string, placeholder?: string): string {
  return resolveFieldPlaceholder({ label, category: 'choice' }, placeholder) ?? `Choose ${label}…`
}
