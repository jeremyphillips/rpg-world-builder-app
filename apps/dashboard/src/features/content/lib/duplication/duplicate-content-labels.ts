import type { ContentSource, ContentTypeKey } from '@rpg/contracts'

import { getContentTypeItemLabel } from '../content-type-labels'

export function formatDuplicateContentDialogHeadline(contentTypeKey: ContentTypeKey): string {
  return `Duplicate ${getContentTypeItemLabel(contentTypeKey)}`
}

export function formatDuplicateContentDialogDescription(source: ContentSource): string {
  if (source === 'system') {
    return 'Create a homebrew copy you can edit. Campaign access resets to the default for new content.'
  }

  return 'Create a draft copy with a new name. Campaign access resets to the default for new content.'
}

export function formatDuplicateContentSubmitLabel(contentTypeKey: ContentTypeKey): string {
  return `Duplicate ${getContentTypeItemLabel(contentTypeKey).toLowerCase()}`
}

export function formatDuplicateContentDefaultName(sourceName: string): string {
  return `${sourceName} Copy`
}

export const DUPLICATE_CONTENT_FALLBACK_ERROR = 'Could not duplicate content.'
