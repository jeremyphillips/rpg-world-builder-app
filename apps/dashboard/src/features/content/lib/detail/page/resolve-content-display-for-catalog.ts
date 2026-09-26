import { resolveContentMediaDomainForContentType, type ContentMediaDomain } from '@rpg/contracts'
import type { ContentTypeKey } from '@rpg/contracts'

/** Maps catalog content types to opted-in media domains. */
export function resolveContentMediaDomainForCatalog(
  contentType: ContentTypeKey,
): ContentMediaDomain | undefined {
  return resolveContentMediaDomainForContentType(contentType)
}
