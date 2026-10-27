import type { ContentTypeKey } from '@rpg/contracts'

import {
  formatContentListLoadErrorMessage,
  getContentTypeMidSentenceLabel,
} from '../../content-type-labels'

/** Non-catalog section queries. Headings already scope the subject. */
export const CONTENT_DETAIL_QUERY_SUBJECT_ERRORS = {
  subclasses: 'Could not load subclasses.',
  members: 'Could not load members.',
  'location-connections': 'Could not load location connections.',
  'connected-parties': 'Could not load connected parties.',
} as const

export type ContentDetailQuerySubject = keyof typeof CONTENT_DETAIL_QUERY_SUBJECT_ERRORS

export type NonEmptyContentTypeKeys = readonly [ContentTypeKey, ...ContentTypeKey[]]

export type ContentDetailQueryErrorSubject =
  | ContentTypeKey
  | ContentDetailQuerySubject
  | NonEmptyContentTypeKeys

export const CONTENT_DETAIL_QUERY_PENDING_LABEL = 'Loading…'

function isContentTypeKeyList(
  subject: ContentDetailQueryErrorSubject,
): subject is NonEmptyContentTypeKeys {
  return Array.isArray(subject)
}

function isContentDetailQuerySubject(subject: string): subject is ContentDetailQuerySubject {
  return Object.hasOwn(CONTENT_DETAIL_QUERY_SUBJECT_ERRORS, subject)
}

function formatContentTypeKeysLoadError(keys: NonEmptyContentTypeKeys): string {
  if (keys.length === 1) {
    return formatContentListLoadErrorMessage(keys[0])
  }

  const labels = keys.map((key) => getContentTypeMidSentenceLabel(key, { plural: true }))
  if (labels.length === 2) {
    return `Could not load ${labels[0]} or ${labels[1]}.`
  }

  const leading = labels.slice(0, -1).join(', ')
  return `Could not load ${leading}, or ${labels[labels.length - 1]}.`
}

/** User-facing sentence for an initial secondary-query failure. */
export function formatContentDetailQueryError(subject: ContentDetailQueryErrorSubject): string {
  if (isContentTypeKeyList(subject)) {
    return formatContentTypeKeysLoadError(subject)
  }

  if (isContentDetailQuerySubject(subject)) {
    return CONTENT_DETAIL_QUERY_SUBJECT_ERRORS[subject]
  }

  return formatContentListLoadErrorMessage(subject)
}
