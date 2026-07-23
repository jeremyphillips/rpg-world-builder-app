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

/** Create submit label — e.g. "Create spell". */
export function formatContentCreateActionLabel(key: ContentTypeKey): string {
  return `Create ${getContentTypeMidSentenceLabel(key)}`
}

/** Create success message for future toast — e.g. "Spell created." */
export function formatContentCreatedMessage(key: ContentTypeKey): string {
  const label = getContentTypeSentenceLabel(key)
  return `${label} created.`
}

/** Generic not-found sentence when no message catalog entry exists. */
export function formatContentNotFoundMessage(key: ContentTypeKey): string {
  return `${getContentTypeSentenceLabel(key)} not found.`
}

export type ContentTypeLoadErrorOptions = {
  /** Use plural sentence form — e.g. list/query failures (`skill proficiencies`). */
  plural?: boolean
}

/** Load failure for a catalog item or collection — e.g. "Could not load species." */
export function formatContentLoadErrorMessage(
  key: ContentTypeKey,
  options: ContentTypeLoadErrorOptions = {},
): string {
  return `Could not load ${getContentTypeMidSentenceLabel(key, options)}.`
}

/** Load failure when a content list query fails — plural sentence form. */
export function formatContentListLoadErrorMessage(key: ContentTypeKey): string {
  return formatContentLoadErrorMessage(key, { plural: true })
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

/** Collection availability caption — e.g. "Spells available in this campaign". */
export function formatContentCollectionAvailabilityCaption(key: ContentTypeKey): string {
  return `${getContentTypeCollectionLabel(key)} available in this campaign`
}

/** Rich-text internal link overview row title — e.g. "Spell Overview". */
export function formatContentOverviewLinkTitle(key: ContentTypeKey): string {
  return `${getContentTypeItemLabel(key)} Overview`
}

/** Combobox placeholder — e.g. "Choose classes…". */
export function formatChooseContentTypePlaceholder(
  key: ContentTypeKey,
  options?: { plural?: boolean },
): string {
  return `Choose ${getContentTypeMidSentenceLabel(key, options)}…`
}

/** Action label — e.g. "Add equipment". */
export function formatAddContentTypeLabel(key: ContentTypeKey): string {
  return `Add ${getContentTypeMidSentenceLabel(key)}`
}

/** Destructive delete confirm headline — e.g. "Delete Custom Folk?". */
export function formatContentDeleteConfirmHeadline(name: string): string {
  return `Delete ${name}?`
}

/** Permanent homebrew delete warning for confirm dialogs. */
export function formatContentDeleteConfirmDescription(key: ContentTypeKey): string {
  return `Permanently delete this homebrew ${getContentTypeMidSentenceLabel(key)}? This cannot be undone.`
}

/** Destructive confirm action label — e.g. "Delete species". */
export function formatContentDeleteConfirmAction(key: ContentTypeKey): string {
  return `Delete ${getContentTypeMidSentenceLabel(key)}`
}

/** Blocked delete dialog headline — e.g. "Cannot delete Custom Folk". */
export function formatContentDeletionBlockedHeadline(name: string): string {
  return `Cannot delete ${name}`
}

/** Blocked delete dialog body when characters still reference the content. */
export function formatContentDeletionBlockedDescription(count: number): string {
  const noun = count === 1 ? 'character' : 'characters'
  return `This content is used by ${count} campaign ${noun}. Remove the references before deleting.`
}

/** Blocked demote dialog headline. */
export function formatContentDemotionBlockedHeadline(): string {
  return 'Cannot move to draft'
}

/** Blocked demote dialog body when characters still reference the content. */
export function formatContentDemotionBlockedDescription(count: number): string {
  const noun = count === 1 ? 'character' : 'characters'
  return `This content is currently used by ${count} active ${noun}.`
}

/** Demote confirm headline — e.g. "Move Custom Folk to draft?". */
export function formatContentDemoteConfirmHeadline(name: string): string {
  return `Move ${name} to draft?`
}

/** Demote confirm description — reversible, not delete language. */
export function formatContentDemoteConfirmDescription(): string {
  return 'Campaign members without manage access will no longer be able to see it.'
}
