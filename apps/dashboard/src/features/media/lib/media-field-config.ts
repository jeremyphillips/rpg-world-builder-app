import {
  getContentMediaPolicy,
  resolveContentMediaDomainForDashboardRoute,
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

export function resolveContentMediaFieldConfig(routeKey: string): MediaFieldConfig | undefined {
  const domain = resolveContentMediaDomainForDashboardRoute(routeKey)
  return domain ? { domain, presentation: COMPACT_MEDIA_FIELD_PRESENTATION } : undefined
}

export function resolveMediaFieldCapacity(config: MediaFieldConfig): number {
  const policy = getContentMediaPolicy(config.domain)
  return resolveContentMediaMaxItems(config.collection ?? policy)
}
