import type { ReactNode } from 'react'
import { ContentCardMedia, contentCardMediaVariants, type ContentCardDensity } from '@rpg/ui'

import { getContentImageUrl } from '../detail/page/content-image-url'

export function buildEntityMediaFromImageKey(
  imageKey: string,
  alt: string,
  density: ContentCardDensity = 'comfortable',
): ReactNode {
  return (
    <ContentCardMedia
      src={getContentImageUrl(imageKey)}
      alt={alt}
      className={contentCardMediaVariants({ density })}
    />
  )
}
