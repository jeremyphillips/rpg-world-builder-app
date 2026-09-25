import type { ContentDisplayImage } from '@rpg/contracts'

import { ContentMediaImage, type ContentMediaImageFrame } from '@/features/content'

export type BuilderOptionCardImageProps = {
  display: ContentDisplayImage
  alt?: string
  frame?: ContentMediaImageFrame
}

/** Builder card artwork — caller resolves the display image. */
export function BuilderOptionCardImage({
  display,
  alt = '',
  frame = 'builderCard',
}: BuilderOptionCardImageProps) {
  return <ContentMediaImage display={display} alt={alt} frame={frame} />
}
