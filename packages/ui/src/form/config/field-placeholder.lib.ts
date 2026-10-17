import {
  nounFromLabel,
  resolveAddPlaceholder,
  resolveChoicePlaceholder,
  resolveSearchPlaceholder,
  type FieldNoun,
} from '@rpg/contracts'

import type { FieldDigits } from '../../components/ui/field-digit-metrics'
import type { FieldMessageCategory } from './field-error-map-category.lib'

export const COMPACT_UNSET_PLACEHOLDER = '—'

export type FieldPlaceholderPresentation = 'default' | 'compact'

export type ClosedPlaceholderIntent = 'choice' | 'add'

export type FieldPlaceholderInput = {
  label: string
  noun?: FieldNoun
  category: FieldMessageCategory
  /** Closed-state copy family — add-to-collection uses `Add {singular}`. */
  intent?: ClosedPlaceholderIntent
  /** Copy treatment — independent of sizing. */
  presentation?: FieldPlaceholderPresentation
  /** Sizing hint; inferred compact when presentation is omitted. */
  digits?: FieldDigits
}

const ADD_ACTION_LABEL_PATTERN = /^Add\s+/i

function resolvePlaceholderPresentation(
  input: FieldPlaceholderInput,
): FieldPlaceholderPresentation {
  return input.presentation ?? (input.digits != null ? 'compact' : 'default')
}

function resolveNounForPlaceholder(input: FieldPlaceholderInput): FieldNoun {
  if (input.noun) return input.noun
  if (input.intent === 'add') {
    throw new Error(
      `Add-to-collection placeholder requires explicit noun metadata (label: "${input.label}").`,
    )
  }
  return nounFromLabel(input.label)
}

/** Default closed-state placeholder for choice fields when config omits one. */
export function resolveFieldPlaceholder(
  input: FieldPlaceholderInput,
  placeholder?: string,
): string | undefined {
  if (placeholder !== undefined) return placeholder
  if (input.category !== 'choice' && input.category !== 'multi') return undefined

  const intent = input.intent ?? 'choice'
  const noun = resolveNounForPlaceholder(input)

  if (intent === 'add') {
    return resolveAddPlaceholder(noun)
  }

  const presentation = resolvePlaceholderPresentation(input)

  if (presentation === 'compact' && input.category === 'choice') {
    return COMPACT_UNSET_PLACEHOLDER
  }

  return resolveChoicePlaceholder(noun, input.category === 'multi')
}

function warnSearchNounFromActionLabel(label: string): void {
  if (process.env.NODE_ENV === 'production') return
  if (ADD_ACTION_LABEL_PATTERN.test(label.trim())) {
    console.warn(
      `[field-placeholder] Combobox search placeholder should use explicit noun metadata, not action label "${label}".`,
    )
  }
}

/** Default open-panel search placeholder when combobox config omits one. */
export function resolveFieldSearchPlaceholder(
  input: { label: string; noun?: FieldNoun },
  searchPlaceholder?: string,
): string {
  if (searchPlaceholder !== undefined) return searchPlaceholder
  if (input.noun == null) {
    warnSearchNounFromActionLabel(input.label)
  }
  const noun = input.noun ?? nounFromLabel(input.label)
  return resolveSearchPlaceholder(noun)
}
