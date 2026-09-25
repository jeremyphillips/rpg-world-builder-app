import type { ContentDisplayFallback, ContentDisplayImage } from '@rpg/contracts'
import { ContentDisplayFallbackIcon, IconContainer } from '@rpg/ui'

import { ContentMediaImage } from '@/features/media/components/content-media-image'

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

  return (
    <IconContainer size="sm">
      <ContentDisplayFallbackIcon fallback={fallback} size="md" />
    </IconContainer>
  )
}
