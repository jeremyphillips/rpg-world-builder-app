import {
  resolveContentDisplayImage,
  type ContentDisplayImage,
  type ContentMedia,
  type ContentSource,
  type ContentTypeKey,
  type MediaRole,
} from '@rpg/contracts'

import {
  mediaImageUrl,
  MEDIA_SOURCE_CROP,
  systemContentImageUrl,
} from '@/features/media/lib/media-display'

const FALLBACK_CONTENT_IMAGE = `${import.meta.env.BASE_URL}fallback-content.png`

export type ResolveDashboardContentDisplayImageInput = {
  media?: ContentMedia | null
  imageKey?: string
  contentType: ContentTypeKey
  slug: string
  contentSource: ContentSource
  rulesetId?: string
  role?: MediaRole
}

/** Resolve a dashboard-ready display image with absolute URLs. */
export function getContentDisplayImage(
  input: ResolveDashboardContentDisplayImageInput,
): ContentDisplayImage {
  const resolved = resolveContentDisplayImage({
    ...input,
    fallbackSrc: FALLBACK_CONTENT_IMAGE,
    resolveUploadSrc: (assetId) => mediaImageUrl(assetId, 'artwork', MEDIA_SOURCE_CROP),
  })

  if (resolved.sourceKind === 'system') {
    return { ...resolved, src: systemContentImageUrl(resolved.src) }
  }

  return resolved
}
