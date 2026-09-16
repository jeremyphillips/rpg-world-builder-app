import { nounFromLabel, resolveChoicePlaceholder, type FieldNoun } from '@rpg/contracts'

import type { FieldDigits } from '../../components/ui/field-digit-metrics'
import type { FieldMessageCategory } from './field-error-map-category.lib'

export const COMPACT_UNSET_PLACEHOLDER = '—'

export type FieldPlaceholderPresentation = 'default' | 'compact'

export type FieldPlaceholderInput = {
  label: string
  noun?: FieldNoun
  category: FieldMessageCategory
  /** Copy treatment — independent of sizing. */
  presentation?: FieldPlaceholderPresentation
  /** Sizing hint; inferred compact when presentation is omitted. */
  digits?: FieldDigits
}

function resolvePlaceholderPresentation(
  input: FieldPlaceholderInput,
): FieldPlaceholderPresentation {
  return input.presentation ?? (input.digits != null ? 'compact' : 'default')
}

/** Default closed-state placeholder for choice fields when config omits one. */
export function resolveFieldPlaceholder(
  input: FieldPlaceholderInput,
  placeholder?: string,
): string | undefined {
  if (placeholder !== undefined) return placeholder
  if (input.category !== 'choice' && input.category !== 'multi') return undefined

  const presentation = resolvePlaceholderPresentation(input)
  const noun = input.noun ?? nounFromLabel(input.label)

  if (presentation === 'compact' && input.category === 'choice') {
    return COMPACT_UNSET_PLACEHOLDER
  }

  return resolveChoicePlaceholder(noun, input.category === 'multi')
}
