import type { ContentMediaDomain } from '@rpg/contracts'
import type { ContentTypeKey } from '@rpg/contracts'

const CATALOG_CONTENT_MEDIA_DOMAIN: Partial<Record<ContentTypeKey, ContentMediaDomain>> = {
  classes: 'class',
  species: 'species',
  equipment: 'equipment',
  locations: 'location',
  organizations: 'organization',
}

/** Maps catalog content types to opted-in media domains. */
export function resolveContentMediaDomainForCatalog(
  contentType: ContentTypeKey,
): ContentMediaDomain | undefined {
  return CATALOG_CONTENT_MEDIA_DOMAIN[contentType]
}
