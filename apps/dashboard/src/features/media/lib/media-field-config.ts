import {
  resolveContentMediaMaxItems,
  type ContentMediaCollectionConstraint,
  type ContentMediaDomain,
} from '@rpg/contracts'

export const MEDIA_FIELD_LAYOUTS = ['compact', 'expanded'] as const
export const MEDIA_FIELD_EMPTY_ACTIONS = ['manager', 'upload'] as const
export const MEDIA_FIELD_COUNT_DISPLAYS = ['capacity', 'count'] as const

export type MediaFieldPresentation = {
  layout: (typeof MEDIA_FIELD_LAYOUTS)[number]
  emptyAction?: (typeof MEDIA_FIELD_EMPTY_ACTIONS)[number]
  countDisplay?: (typeof MEDIA_FIELD_COUNT_DISPLAYS)[number]
}

export type MediaFieldConfig = {
  domain: ContentMediaDomain
  collection?: ContentMediaCollectionConstraint
  presentation: MediaFieldPresentation
}

export const COMPACT_MEDIA_FIELD_PRESENTATION: MediaFieldPresentation = { layout: 'compact' }
export const EXPANDED_MEDIA_FIELD_PRESENTATION: MediaFieldPresentation = { layout: 'expanded' }

const CONTENT_MEDIA_ROUTE_DOMAINS = {
  characters: 'character',
  classes: 'class',
  species: 'species',
  equipment: 'equipment',
  locations: 'location',
  organizations: 'organization',
} as const satisfies Record<string, ContentMediaDomain>

export function resolveContentMediaFieldConfig(routeKey: string): MediaFieldConfig | undefined {
  const domain = CONTENT_MEDIA_ROUTE_DOMAINS[routeKey as keyof typeof CONTENT_MEDIA_ROUTE_DOMAINS]
  return domain ? { domain, presentation: COMPACT_MEDIA_FIELD_PRESENTATION } : undefined
}

export function resolveMediaFieldCapacity(config: MediaFieldConfig): number {
  return resolveContentMediaMaxItems(config.collection)
}
