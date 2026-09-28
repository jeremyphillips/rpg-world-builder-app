import {
  resolveAvailableContentMediaSources,
  type ContentMedia,
  type ContentMediaDomain,
  type ResolveAvailableContentMediaSourcesResult,
} from '@rpg/contracts'

import type { MediaManagerContentContext } from './media-manager.types'

export function resolveMediaContentAvailability(input: {
  media: ContentMedia
  domain: ContentMediaDomain
  contentContext?: MediaManagerContentContext
}): ResolveAvailableContentMediaSourcesResult {
  const { media, domain, contentContext } = input
  if (!contentContext) {
    return resolveAvailableContentMediaSources({
      media,
      domain,
    })
  }

  return resolveAvailableContentMediaSources({
    media,
    domain,
    contentSource: contentContext.contentSource,
    subject: contentContext.subject,
    slug: contentContext.slug,
    rulesetId: contentContext.rulesetId,
    campaignImageSetId: contentContext.campaignImageSetId,
  })
}

export function isBlockingMediaContextForEdit(input: {
  mode: 'form' | 'detail'
  formMode?: 'create' | 'edit'
  availability: ResolveAvailableContentMediaSourcesResult
}): boolean {
  if (input.mode === 'detail') {
    return input.availability.contextStatus === 'incomplete'
  }
  return input.formMode === 'edit' && input.availability.contextStatus === 'incomplete'
}

export const MEDIA_CONTEXT_INCOMPLETE_MESSAGE =
  "Images can't be listed until this record's identity is available."
