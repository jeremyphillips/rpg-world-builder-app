import {
  MEDIA_API_PATH,
  MEDIA_RENDITION_CROP_QUERY_KEYS,
  type MediaRenditionPreset,
  type NormalizedCrop,
} from '@rpg/contracts'

export const MEDIA_SOURCE_CROP: NormalizedCrop = { x: 0, y: 0, width: 1, height: 1 }
export function mediaImageUrl(
  assetId: string,
  preset: MediaRenditionPreset = 'artwork',
  crop?: NormalizedCrop,
) {
  const query = new URLSearchParams()
  if (crop)
    for (const key of Object.keys(MEDIA_RENDITION_CROP_QUERY_KEYS) as (keyof NormalizedCrop)[]) {
      query.set(MEDIA_RENDITION_CROP_QUERY_KEYS[key], String(crop[key]))
    }
  return `${MEDIA_API_PATH}/assets/${encodeURIComponent(assetId)}/renditions/${preset}${crop ? `?${query}` : ''}`
}
export function mediaErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unable to save image changes. Please retry.'
}

export function systemContentImageUrl(srcPath: string): string {
  const base = import.meta.env.BASE_URL
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const normalizedPath = srcPath.startsWith('/') ? srcPath.slice(1) : srcPath
  return `${normalizedBase}${normalizedPath}`
}
