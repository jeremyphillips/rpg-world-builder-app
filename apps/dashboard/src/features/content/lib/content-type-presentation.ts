import type { ContentTypeKey } from '@rpg/contracts'

export type CatalogLayerPresentation = 'badge-and-filter' | 'suppressed'

export type ContentTypePresentationPolicy = {
  catalogLayer: CatalogLayerPresentation
}

/**
 * Product-facing content presentation policy.
 *
 * This is intentionally separate from tooling catalog metadata: whether a type
 * bundles system records does not determine whether campaign authorship should
 * be emphasized in the UI.
 */
export const CONTENT_TYPE_PRESENTATION = {
  classes: { catalogLayer: 'badge-and-filter' },
  spells: { catalogLayer: 'badge-and-filter' },
  species: { catalogLayer: 'badge-and-filter' },
  feats: { catalogLayer: 'badge-and-filter' },
  equipment: { catalogLayer: 'badge-and-filter' },
  'skill-proficiencies': { catalogLayer: 'badge-and-filter' },
  organizations: { catalogLayer: 'suppressed' },
  locations: { catalogLayer: 'suppressed' },
  monsters: { catalogLayer: 'badge-and-filter' },
} as const satisfies Record<ContentTypeKey, ContentTypePresentationPolicy>

export function getContentTypePresentation(
  contentType: ContentTypeKey,
): ContentTypePresentationPolicy {
  return CONTENT_TYPE_PRESENTATION[contentType]
}

export function shouldPresentCatalogLayer(contentType: ContentTypeKey): boolean {
  return getContentTypePresentation(contentType).catalogLayer === 'badge-and-filter'
}
