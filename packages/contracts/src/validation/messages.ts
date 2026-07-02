import { defineMessage } from './define-message'

// ---------------------------------------------------------------------------
// Label helpers — presentation-safe transforms for interpolating field labels
// into sentence templates. See docs/validation-messages.md for the copy style.
// ---------------------------------------------------------------------------

/**
 * Lowercases a label for mid-sentence use ("Choose a valid rarity.") while
 * preserving acronyms and initialisms ("XP", "AC bonus").
 */
export function midSentenceLabel(label: string): string {
  if (/^[A-Z]{2}/.test(label)) return label
  return label.charAt(0).toLowerCase() + label.slice(1)
}

/** Prefixes a mid-sentence label with its indefinite article ("a rarity", "an ability"). */
export function withArticle(label: string): string {
  const article = /^[aeiou]/i.test(label) ? 'an' : 'a'
  return `${article} ${label}`
}

/** Naive singular form of a plural label ("Wealth tiers" → "Wealth tier"). */
export function singularizeLabel(label: string): string {
  if (/ies$/.test(label)) return `${label.slice(0, -3)}y`
  if (/[^su]s$/.test(label)) return label.slice(0, -1)
  return label
}

// ---------------------------------------------------------------------------
// Global field validation defaults (tier 1). Formatted by the form layer's
// error map with the field's configured label — schemas stay message-free.
// ---------------------------------------------------------------------------

export const fieldValidationMessages = {
  /** Empty required text-like field. */
  requiredText: defineMessage<{ label: string }>(
    'validation.field.requiredText',
    ({ label }) => `${label} is required.`,
  ),
  /** Empty required choice-like field (select, radio, chips single, combobox). */
  requiredSelect: defineMessage<{ label: string }>(
    'validation.field.requiredSelect',
    ({ label }) => `Choose ${withArticle(midSentenceLabel(label))}.`,
  ),
  /** Value not among the allowed options. */
  invalidSelect: defineMessage<{ label: string }>(
    'validation.field.invalidSelect',
    ({ label }) => `Choose a valid ${midSentenceLabel(label)}.`,
  ),
  /** Non-numeric input in a number-like field. */
  invalidNumber: defineMessage('validation.field.invalidNumber', () => 'Enter a valid number.'),
  minNumber: defineMessage<{ label: string; min: number }>(
    'validation.field.minNumber',
    ({ label, min }) => `${label} must be at least ${min}.`,
  ),
  maxNumber: defineMessage<{ label: string; max: number }>(
    'validation.field.maxNumber',
    ({ label, max }) => `${label} cannot exceed ${max}.`,
  ),
  integer: defineMessage<{ label: string }>(
    'validation.field.integer',
    ({ label }) => `${label} must be a whole number.`,
  ),
  minLength: defineMessage<{ label: string; min: number }>(
    'validation.field.minLength',
    ({ label, min }) => `${label} must be at least ${min} characters.`,
  ),
  maxLength: defineMessage<{ label: string; max: number }>(
    'validation.field.maxLength',
    ({ label, max }) => `${label} cannot exceed ${max} characters.`,
  ),
  /** Multi-select / repeatable list needs at least one entry. */
  minItems: defineMessage<{ itemLabel: string }>(
    'validation.field.minItems',
    ({ itemLabel }) => `Add at least one ${itemLabel}.`,
  ),
  /** Multi-select / repeatable list needs `min` (> 1) entries; `itemsLabel` is plural. */
  minItemsCount: defineMessage<{ itemsLabel: string; min: number }>(
    'validation.field.minItemsCount',
    ({ itemsLabel, min }) => `Add at least ${min} ${itemsLabel}.`,
  ),
  /** Entry duplicates one already in the list (for domain refinements). */
  duplicateItem: defineMessage<{ itemLabel: string }>(
    'validation.field.duplicateItem',
    ({ itemLabel }) => `This ${itemLabel} is already used.`,
  ),
}
