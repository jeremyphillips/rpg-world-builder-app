import type { NormalizedCrop } from '@rpg/contracts'

import { resolveMediaAssetUrl } from './resolve-media-asset-url.lib'

/** Full-frame crop for artwork renditions — shared across display-image resolvers. */
export const MEDIA_SOURCE_CROP: NormalizedCrop = { x: 0, y: 0, width: 1, height: 1 }

export function resolveMediaArtworkUrl(assetId: string): string {
  return resolveMediaAssetUrl(assetId, 'artwork', MEDIA_SOURCE_CROP)
}
