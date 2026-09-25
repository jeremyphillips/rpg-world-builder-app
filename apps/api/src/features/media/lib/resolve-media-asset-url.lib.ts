import {
  MEDIA_API_PATH,
  MEDIA_RENDITION_CROP_QUERY_KEYS,
  type MediaRenditionPreset,
  type NormalizedCrop,
} from '@rpg/contracts'

export function resolveMediaAssetUrl(
  assetId: string,
  preset: MediaRenditionPreset = 'artwork',
  crop?: NormalizedCrop,
): string {
  const query = new URLSearchParams()
  if (crop) {
    for (const key of Object.keys(MEDIA_RENDITION_CROP_QUERY_KEYS) as (keyof NormalizedCrop)[]) {
      query.set(MEDIA_RENDITION_CROP_QUERY_KEYS[key], String(crop[key]))
    }
  }
  return `${MEDIA_API_PATH}/assets/${encodeURIComponent(assetId)}/renditions/${preset}${crop ? `?${query}` : ''}`
}
