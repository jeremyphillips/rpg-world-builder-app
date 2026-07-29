import type { ContentTypeKey } from '@rpg/contracts'

export type ContentSourcePresentation = 'badge-and-filter' | 'suppressed'

export type ContentTypePresentationPolicy = {
  source: ContentSourcePresentation
}

/**
 * Product-facing content presentation policy.
 *
 * This is intentionally separate from tooling catalog metadata: whether a type
 * bundles system records does not determine whether campaign authorship should
 * be emphasized in the UI.
 */
export const CONTENT_TYPE_PRESENTATION = {
  classes: { source: 'badge-and-filter' },
  spells: { source: 'badge-and-filter' },
  species: { source: 'badge-and-filter' },
  feats: { source: 'badge-and-filter' },
  equipment: { source: 'badge-and-filter' },
  'skill-proficiencies': { source: 'badge-and-filter' },
} as const satisfies Record<ContentTypeKey, ContentTypePresentationPolicy>

export function getContentTypePresentation(
  contentType: ContentTypeKey,
): ContentTypePresentationPolicy {
  return CONTENT_TYPE_PRESENTATION[contentType]
}

export function shouldPresentContentSource(contentType: ContentTypeKey): boolean {
  return getContentTypePresentation(contentType).source === 'badge-and-filter'
}
