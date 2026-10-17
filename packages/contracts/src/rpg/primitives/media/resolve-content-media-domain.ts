import type { ContentTypeKey } from '../content/content-type-keys'
import type { ContentMediaDomain } from './media-policy'

/** Catalog content types opted into `ContentMedia`. */
export const CONTENT_TYPE_MEDIA_DOMAIN = {
  classes: 'class',
  species: 'species',
  equipment: 'equipment',
  locations: 'location',
  organizations: 'organization',
  monsters: 'monster',
} as const satisfies Partial<Record<ContentTypeKey, ContentMediaDomain>>

export type ContentTypeMediaEnabledKey = keyof typeof CONTENT_TYPE_MEDIA_DOMAIN

/** SSOT for API catalog media persistence, overview image columns, and form media tests. */
export const CONTENT_TYPE_MEDIA_ENABLED_KEYS = Object.keys(
  CONTENT_TYPE_MEDIA_DOMAIN,
) as ContentTypeMediaEnabledKey[]

export function isContentTypeMediaEnabled(
  contentType: ContentTypeKey,
): contentType is ContentTypeMediaEnabledKey {
  return contentType in CONTENT_TYPE_MEDIA_DOMAIN
}

/** Dashboard route segments (including `characters`) with managed media. */
export const DASHBOARD_MEDIA_ROUTE_DOMAINS = {
  characters: 'character',
  ...CONTENT_TYPE_MEDIA_DOMAIN,
} as const satisfies Record<string, ContentMediaDomain>

export type DashboardMediaRouteKey = keyof typeof DASHBOARD_MEDIA_ROUTE_DOMAINS

/** Maps a catalog content type to its media domain when opted in. */
export function resolveContentMediaDomainForContentType(
  contentType: ContentTypeKey,
): ContentMediaDomain | undefined {
  return CONTENT_TYPE_MEDIA_DOMAIN[contentType as keyof typeof CONTENT_TYPE_MEDIA_DOMAIN]
}

/** Maps a dashboard content route key to its media domain when opted in. */
export function resolveContentMediaDomainForDashboardRoute(
  routeKey: string,
): ContentMediaDomain | undefined {
  return DASHBOARD_MEDIA_ROUTE_DOMAINS[routeKey as DashboardMediaRouteKey]
}
