import { cn } from '@rpg/ui'
import { resolveNormalizedCropImageLayout, type ContentDisplayImage } from '@rpg/contracts'

import {
  contentMediaImageClasses,
  contentMediaImageFrameVariants,
} from './content-media-image.variants'

export type ContentMediaImageFrame = 'intrinsic' | 'primary' | 'square'

export type ContentMediaImageProps = {
  display: ContentDisplayImage
  alt: string
  frame?: ContentMediaImageFrame
  className?: string
}

/** Renders a content display image with optional normalized-crop math. */
export function ContentMediaImage({
  display,
  alt,
  frame = 'intrinsic',
  className,
}: ContentMediaImageProps) {
  const cropLayout = display.crop ? resolveNormalizedCropImageLayout(display.crop) : undefined

  return (
    <div className={cn(contentMediaImageFrameVariants({ frame }), className)}>
      <img
        src={display.src}
        alt={alt}
        className={contentMediaImageClasses}
        style={
          cropLayout
            ? {
                width: `${cropLayout.widthPercent}%`,
                height: `${cropLayout.heightPercent}%`,
                marginLeft: `${cropLayout.offsetXPercent}%`,
                marginTop: `${cropLayout.offsetYPercent}%`,
              }
            : undefined
        }
      />
    </div>
  )
}
