import type { ContentTypeKey } from '../../primitives/content/content-type-keys'
import { getContentTypeTerm } from '../../content/lib/content-type-terms'
import { getTermSentenceForm, type VocabularyTerm } from '../../vocab/types'

/** Noun forms shared by catalog picker chrome templates. */
export type CatalogNoun = {
  readonly label: string
  readonly singular: string
  readonly plural: string
}

/** Generated catalog picker chrome. Descriptions and domain labels stay as overrides. */
export type CatalogPickerCopy = {
  readonly searchPlaceholder: string
  readonly chooseTitle: string
  readonly addLabel: string
  readonly noResultsMessage: string
  readonly noItemsMessage: string
  readonly noOptionsMessage: string
  readonly selectionFullMessage: string
}

/** Noun forms from a catalog content-type term. */
export function catalogNounFromContentType(key: ContentTypeKey): CatalogNoun {
  return catalogNounFromTerm(getContentTypeTerm(key))
}

/** Noun forms from any vocabulary term (`label` plus counted sentence forms). */
export function catalogNounFromTerm(term: VocabularyTerm): CatalogNoun {
  return {
    label: term.label,
    singular: getTermSentenceForm(term, 1),
    plural: getTermSentenceForm(term, 2),
  }
}

/**
 * Standard catalog picker chrome from a noun.
 * Pass `overrides` only for copy that is not a noun template (descriptions, empty-state verbs).
 */
export function formatCatalogPickerCopy(
  noun: CatalogNoun,
  overrides?: Partial<CatalogPickerCopy>,
): CatalogPickerCopy {
  const { singular, plural } = noun
  const copy: CatalogPickerCopy = {
    searchPlaceholder: `Search ${plural}`,
    chooseTitle: `Choose ${singular}`,
    addLabel: `Add ${singular}`,
    noResultsMessage: `No ${plural} match your search.`,
    noItemsMessage: `No ${plural} are available.`,
    noOptionsMessage: `No ${plural} are available for this choice.`,
    selectionFullMessage: `You have selected the maximum number of ${plural} for this choice.`,
  }

  if (!overrides) return copy

  const merged = { ...copy }
  for (const key of Object.keys(overrides) as (keyof CatalogPickerCopy)[]) {
    const value = overrides[key]
    if (value !== undefined) {
      merged[key] = value
    }
  }
  return merged
}
