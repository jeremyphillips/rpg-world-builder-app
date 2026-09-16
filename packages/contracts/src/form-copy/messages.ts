/**
 * Linguistic templates for generated field copy (placeholders, hints).
 * Validation tier-1 messages import from here; presentation layers compose
 * these with local compact/unset treatment.
 */

/** Lowercases a label for mid-sentence use while preserving acronyms ("XP", "AC bonus"). */
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

/** Singular/plural noun phrases for generated field copy. */
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
