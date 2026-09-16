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

/** Singular/plural noun phrases for generated field copy (validation, hints, placeholders). */
export type FieldNoun = {
  singular: string
  plural?: string
}

/** Best-effort noun metadata from a field label when explicit `noun` is omitted. */
export function nounFromLabel(label: string): FieldNoun {
  return {
    singular: midSentenceLabel(singularizeLabel(label)),
    plural: midSentenceLabel(label),
  }
}

function pluralNounPhrase(noun: FieldNoun): string {
  return midSentenceLabel(noun.plural ?? noun.singular)
}

function singularNounPhrase(noun: FieldNoun): string {
  return midSentenceLabel(noun.singular)
}

export type ChoiceCountConstraints = {
  min?: number
  max?: number
}

/**
 * Shared choice-field count copy for validation messages and constraint hints.
 * Uses "one" for a minimum of 1; numerals elsewhere (including ranges).
 */
export function choiceCountPhrase(noun: FieldNoun, constraints: ChoiceCountConstraints): string {
  const { min, max } = constraints
  const plural = pluralNounPhrase(noun)

  if (min !== undefined && max !== undefined) {
    if (min === max) {
      if (min === 1) return `Choose one ${singularNounPhrase(noun)}.`
      return `Choose ${min} ${plural}.`
    }
    return `Choose ${min}–${max} ${plural}.`
  }

  if (min !== undefined) {
    if (min === 1) return `Choose at least one ${singularNounPhrase(noun)}.`
    return `Choose at least ${min} ${plural}.`
  }

  if (max !== undefined) {
    if (max === 1) return `Choose up to one ${singularNounPhrase(noun)}.`
    return `Choose up to ${max} ${plural}.`
  }

  return `Choose ${plural}.`
}

/** Default closed-state placeholder for single- or multi-select choice fields. */
export function resolveChoicePlaceholder(noun: FieldNoun, multiple: boolean): string {
  if (multiple) {
    return `Choose ${pluralNounPhrase(noun)}…`
  }
  return `Choose ${withArticle(singularNounPhrase(noun))}…`
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
