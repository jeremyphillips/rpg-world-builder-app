import type { ContentDisplayImage } from '@rpg/contracts'
import { IconContainer } from '@rpg/ui'
import type { ReactNode } from 'react'

import { ContentMediaImage } from '@/features/media/components/content-media-image'

export type ContentPreviewRailMediaProps = {
  displayImage?: ContentDisplayImage
  fallbackIcon: ReactNode
}

export function ContentPreviewRailMedia({
  displayImage,
  fallbackIcon,
}: ContentPreviewRailMediaProps) {
  if (displayImage) {
    return <ContentMediaImage display={displayImage} alt="" frame="insetSm" />
  }

  return <IconContainer size="sm">{fallbackIcon}</IconContainer>
}
