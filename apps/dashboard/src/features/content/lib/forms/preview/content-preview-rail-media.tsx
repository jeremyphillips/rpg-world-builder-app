import type { ContentDisplayFallback, ContentDisplayImage } from '@rpg/contracts'

import {
  ContentMediaFallback,
  ContentMediaImage,
} from '@/features/media/components/content-media-image'

export type ContentPreviewRailMediaProps = {
  displayImage?: ContentDisplayImage
  fallback?: ContentDisplayFallback
}

export function ContentPreviewRailMedia({
  displayImage,
  fallback = 'generic',
}: ContentPreviewRailMediaProps) {
  if (displayImage) {
    return <ContentMediaImage display={displayImage} alt="" frame="insetSm" />
  }

  return <ContentMediaFallback fallback={fallback} frame="insetSm" />
}
