import { choiceCountPhrase, midSentenceLabel, withArticle } from '../form-copy/messages'

import { defineMessage } from './define-message'

/**
 * `{subjectLabel} is required when {conditionClause}.`
 *
 * `conditionClause` is a lowercase clause with no leading "when" and no trailing
 * punctuation (e.g. `'the material component is selected'`).
 */
export const requiredWhenCopy = (subjectLabel: string, conditionClause: string) =>
  `${subjectLabel} is required when ${conditionClause}.`

/**
 * `{subjectLabel} must be between {min} and {max}.`
 *
 * Bounds accept strings for named concepts whose number is not known at message
 * time; prefer concrete numbers when available.
 */
export const betweenCopy = (subjectLabel: string, min: string | number, max: string | number) =>
  `${subjectLabel} must be between ${min} and ${max}.`

// ---------------------------------------------------------------------------
// Global field validation defaults (tier 1). Formatted by the form layer's
// error map with the field's configured label — schemas stay message-free.
// ---------------------------------------------------------------------------

export const fieldValidationMessages = {
  /** Empty required text-like field. */
  requiredText: defineMessage<{ label: string }>(
    'validation.field.requiredText',
    ({ label }) => `${label} is required.`,
    ({ label }) => `Missing ${label}`,
  ),
  /** Empty required choice-like field (select, radio, chips single, combobox). */
  requiredSelect: defineMessage<{ label: string }>(
    'validation.field.requiredSelect',
    ({ label }) => `Choose ${withArticle(midSentenceLabel(label))}.`,
    ({ label }) => `Missing ${label}`,
  ),
  /** Empty required choice-like field using a vocab sentence phrase (no article). */
  requiredSelectPhrase: defineMessage<{ phrase: string }>(
    'validation.field.requiredSelectPhrase',
    ({ phrase }) => `Choose ${phrase}.`,
  ),
  /** Value not among the allowed options. */
  invalidSelect: defineMessage<{ label: string }>(
    'validation.field.invalidSelect',
    ({ label }) => `Choose a valid ${midSentenceLabel(label)}.`,
    ({ label }) => `Invalid ${label}`,
  ),
  /** Unregistered field path with no configured label. */
  requiredUnlabeled: defineMessage('validation.field.requiredUnlabeled', () => 'Required.'),
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
  /** Multi-select choice field (chips/combobox) needs at least one selection. */
  minSelections: defineMessage<{ itemLabel: string }>(
    'validation.field.minSelections',
    ({ itemLabel }) => choiceCountPhrase({ singular: itemLabel }, { min: 1 }),
  ),
  /** Multi-select choice field needs `min` (> 1) selections; `itemsLabel` is plural. */
  minSelectionsCount: defineMessage<{ itemsLabel: string; min: number }>(
    'validation.field.minSelectionsCount',
    ({ itemsLabel, min }) =>
      choiceCountPhrase({ singular: itemsLabel, plural: itemsLabel }, { min }),
  ),
  /** Multi-select choice field exceeds `max` selections; `itemsLabel` is plural. */
  maxSelectionsCount: defineMessage<{ itemsLabel: string; max: number }>(
    'validation.field.maxSelectionsCount',
    ({ itemsLabel, max }) =>
      choiceCountPhrase({ singular: itemsLabel, plural: itemsLabel }, { max }),
  ),
  /** Multi-select choice field must contain exactly `count` selections. */
  exactSelectionsCount: defineMessage<{ itemsLabel: string; count: number }>(
    'validation.field.exactSelectionsCount',
    ({ itemsLabel, count }) =>
      choiceCountPhrase({ singular: itemsLabel, plural: itemsLabel }, { min: count, max: count }),
  ),
  /** Multi-select choice field must contain between `min` and `max` selections. */
  rangeSelectionsCount: defineMessage<{ itemsLabel: string; min: number; max: number }>(
    'validation.field.rangeSelectionsCount',
    ({ itemsLabel, min, max }) =>
      choiceCountPhrase({ singular: itemsLabel, plural: itemsLabel }, { min, max }),
  ),
  /** Repeatable array container needs at least one entry. */
  minItems: defineMessage<{ itemLabel: string }>(
    'validation.field.minItems',
    ({ itemLabel }) => `Add at least one ${itemLabel}.`,
  ),
  /** Repeatable array container needs `min` (> 1) entries; `itemsLabel` is plural. */
  minItemsCount: defineMessage<{ itemsLabel: string; min: number }>(
    'validation.field.minItemsCount',
    ({ itemsLabel, min }) => `Add at least ${min} ${itemsLabel}.`,
  ),
  /** Entry duplicates one already in the list (for domain refinements). */
  duplicateItem: defineMessage<{ itemLabel: string }>(
    'validation.field.duplicateItem',
    ({ itemLabel }) => `This ${itemLabel} is already used.`,
  ),
  /** Email format check (`z.email()`). */
  invalidEmail: defineMessage(
    'validation.field.invalidEmail',
    () => 'Enter a valid email address.',
  ),
  /** URL format check. */
  invalidUrl: defineMessage('validation.field.invalidUrl', () => 'Enter a valid URL.'),
  /** Regex / pattern mismatch on a text-like field. */
  invalidFormat: defineMessage<{ label: string }>(
    'validation.field.invalidFormat',
    ({ label }) => `${label} has an invalid format.`,
  ),
  /** Content slug pattern (`slugSchema`). */
  invalidSlug: defineMessage(
    'validation.field.invalidSlug',
    () => 'Use lowercase letters, numbers, and hyphens only.',
  ),
  /** Value present but not among allowed options (non-choice fields). */
  invalidValue: defineMessage<{ label: string }>(
    'validation.field.invalidValue',
    ({ label }) => `${label} has an invalid value.`,
  ),
  /** Discriminated union row missing required branch fields. */
  incompleteUnionOption: defineMessage(
    'validation.field.incompleteUnionOption',
    () => 'Complete the required fields for this option.',
  ),
  /** Array must contain exactly `count` entries. */
  exactItemsCount: defineMessage<{ itemsLabel: string; count: number }>(
    'validation.field.exactItemsCount',
    ({ itemsLabel, count }) => `Add exactly ${count} ${itemsLabel}.`,
  ),
  /** Fallback when `too_small` origin is not handled above. */
  tooSmallGeneric: defineMessage<{ label: string }>(
    'validation.field.tooSmallGeneric',
    ({ label }) => `${label} is too small.`,
  ),
  /** Fallback when `too_big` origin is not handled above. */
  tooBigGeneric: defineMessage<{ label: string }>(
    'validation.field.tooBigGeneric',
    ({ label }) => `${label} is too large.`,
  ),
  /** Last-resort for registered paths with no specific formatter match. */
  invalidField: defineMessage<{ label: string }>(
    'validation.field.invalidField',
    ({ label }) => `${label} is invalid.`,
  ),
}
