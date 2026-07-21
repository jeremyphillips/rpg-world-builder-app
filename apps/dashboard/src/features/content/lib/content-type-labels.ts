import { getContentTypeTerm, vocabularyTermLabel, type ContentTypeKey } from '@rpg/contracts'

/** Capitalizes the first letter of each word for hub and navigation surfaces. */
function titleCaseWords(value: string): string {
  return value.replace(/\b\w/g, (character) => character.toUpperCase())
}

/** Plural title case for sidebar, breadcrumbs, and overview headings. */
export function getContentTypeCollectionLabel(key: ContentTypeKey): string {
  const phrase = vocabularyTermLabel(getContentTypeTerm(key), {
    number: 'plural',
    casing: 'sentence',
  })
  return titleCaseWords(phrase)
}

/** Singular title case for create headings and item references. */
export function getContentTypeItemLabel(key: ContentTypeKey): string {
  return getContentTypeTerm(key).label
}

/** Sentence-case singular or plural with leading capital for field chrome. */
export function getContentTypeSentenceLabel(
  key: ContentTypeKey,
  options?: { plural?: boolean },
): string {
  const phrase = vocabularyTermLabel(getContentTypeTerm(key), {
    number: options?.plural ? 'plural' : 'singular',
    casing: 'sentence',
  })
  return phrase.charAt(0).toUpperCase() + phrase.slice(1)
}

/** Compact label when the content-type term defines one; otherwise undefined. */
export function getContentTypeCompactLabel(key: ContentTypeKey): string | undefined {
  return getContentTypeTerm(key).compactLabel
}

/** Create route heading — e.g. "New Species". */
export function formatContentCreateHeading(key: ContentTypeKey): string {
  return `New ${getContentTypeItemLabel(key)}`
}

/** Generic not-found sentence when no message catalog entry exists. */
export function formatContentNotFoundMessage(key: ContentTypeKey): string {
  return `${getContentTypeSentenceLabel(key)} not found.`
}

/** Mid-sentence lowercase noun phrase for row actions and aria labels. */
export function getContentTypeMidSentenceLabel(
  key: ContentTypeKey,
  options?: { plural?: boolean },
): string {
  return vocabularyTermLabel(getContentTypeTerm(key), {
    number: options?.plural ? 'plural' : 'singular',
    casing: 'sentence',
  })
}

/** Overview table caption prefix — e.g. "Playable species available in this campaign". */
export function formatContentOverviewCaption(key: ContentTypeKey, qualifier: string): string {
  const phrase = vocabularyTermLabel(getContentTypeTerm(key), {
    number: 'plural',
    casing: 'sentence',
  })
  return `${qualifier} ${phrase} available in this campaign`
}
