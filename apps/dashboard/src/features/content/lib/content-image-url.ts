import { getAssetUrl } from '@rpg/contracts'

// Served from public/ so it's available at the Vite base URL with no asset-pipeline processing.
const FALLBACK_CONTENT_IMAGE = `${import.meta.env.BASE_URL}fallback-content.png`

/** Resolves a content item's artwork URL, falling back to the shared placeholder. */
export function getContentImageUrl(imageKey?: string): string {
  return imageKey ? getAssetUrl(imageKey) : FALLBACK_CONTENT_IMAGE
}
