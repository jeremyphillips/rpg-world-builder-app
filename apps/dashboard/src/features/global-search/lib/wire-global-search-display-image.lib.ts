import type { ContentDisplayImage } from '@rpg/contracts'

import { systemContentImageUrl } from '@/features/media/lib/media-display'

/** Absolutizes registry-relative system art for client `<img>` src. */
export function wireGlobalSearchDisplayImage(
  displayImage?: ContentDisplayImage,
): ContentDisplayImage | undefined {
  if (!displayImage) {
    return undefined
  }

  if (displayImage.sourceKind === 'system') {
    return { ...displayImage, src: systemContentImageUrl(displayImage.src) }
  }

  return displayImage
}
