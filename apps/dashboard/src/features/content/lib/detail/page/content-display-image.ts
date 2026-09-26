import {
  resolveContentDisplayFallback,
  resolveContentDisplayImage,
  type ContentDisplayFallback,
  type ContentDisplayImage,
  type ContentDisplaySurface,
  type ContentMedia,
  type ContentSource,
  type ContentTypeKey,
  type ResolveContentDisplayImageResult,
} from '@rpg/contracts'

import {
  mediaImageUrl,
  MEDIA_SOURCE_CROP,
  systemContentImageUrl,
} from '@/features/media/lib/media-display'

import { resolveContentMediaDomainForCatalog } from './resolve-content-display-for-catalog'

export type ResolveDashboardContentDisplayInput = {
  media?: ContentMedia | null
  contentType: ContentTypeKey
  slug: string
  contentSource: ContentSource
  rulesetId?: string
  surface?: ContentDisplaySurface
  campaignImageSetId?: string
}

export type DashboardContentDisplayResult = ResolveContentDisplayImageResult

function absolutizeDisplayImage(display: ContentDisplayImage): ContentDisplayImage {
  if (display.sourceKind === 'system') {
    return { ...display, src: systemContentImageUrl(display.src) }
  }
  return display
}

function resolveDomainForCatalogInput(contentType: ContentTypeKey) {
  return resolveContentMediaDomainForCatalog(contentType)
}

/** Resolve compact/detail/field display with dashboard-ready absolute URLs. */
export function resolveDashboardContentDisplay(
  input: ResolveDashboardContentDisplayInput,
): DashboardContentDisplayResult {
  const domain = resolveDomainForCatalogInput(input.contentType)
  if (!domain) {
    return { outcome: 'fallback', fallback: 'generic' }
  }

  const result = resolveContentDisplayImage({
    media: input.media,
    surface: input.surface ?? 'detail',
    domain,
    contentType: input.contentType,
    slug: input.slug,
    contentSource: input.contentSource,
    rulesetId: input.rulesetId,
    campaignImageSetId: input.campaignImageSetId,
    resolveUploadSrc: (assetId) => mediaImageUrl(assetId, 'artwork', MEDIA_SOURCE_CROP),
  })

  if (result.outcome === 'fallback') {
    return result
  }

  return { outcome: 'image', display: absolutizeDisplayImage(result.display) }
}

/** Wire image when present; omit for semantic fallback surfaces. */
export function getContentDisplayImage(
  input: ResolveDashboardContentDisplayInput,
): ContentDisplayImage | undefined {
  const resolved = resolveDashboardContentDisplay(input)
  return resolved.outcome === 'image' ? resolved.display : undefined
}

export function resolveDashboardContentDisplayFallback(
  input: ResolveDashboardContentDisplayInput,
): ContentDisplayFallback {
  const domain = resolveDomainForCatalogInput(input.contentType)
  if (!domain) {
    return 'generic'
  }

  const resolved = resolveDashboardContentDisplay(input)
  if (resolved.outcome === 'fallback') {
    return resolved.fallback
  }

  return resolveContentDisplayFallback({ domain, surface: input.surface ?? 'detail' })
}
