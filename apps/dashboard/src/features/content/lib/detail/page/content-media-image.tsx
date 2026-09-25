import { cn } from '@rpg/ui'
import { resolveNormalizedCropImageLayout, type ContentDisplayImage } from '@rpg/contracts'

import {
  resolveContentImagePresentationDefault,
  type ContentImagePresentationSurface,
} from './content-image-presentation-defaults'
import {
  contentMediaImageBuilderBlendClasses,
  contentMediaImageClasses,
  contentMediaImageFrameVariants,
} from './content-media-image.variants'

export type ContentMediaImageFrame =
  | 'intrinsic'
  | 'primary'
  | 'builderSheetHero'
  | 'builderCard'
  | 'square'

export type ContentMediaImageProps = {
  display: ContentDisplayImage
  alt: string
  frame?: ContentMediaImageFrame
  className?: string
}

function resolvePresentationSurface(
  frame: ContentMediaImageFrame,
): ContentImagePresentationSurface {
  if (frame === 'square') return 'thumbnail'
  if (frame === 'builderCard') return 'builderCard'
  if (frame === 'builderSheetHero') return 'primary'
  return 'primary'
}

/** Renders a content display image with optional normalized-crop math. */
export function ContentMediaImage({
  display,
  alt,
  frame = 'intrinsic',
  className,
}: ContentMediaImageProps) {
  const cropLayout = display.crop ? resolveNormalizedCropImageLayout(display.crop) : undefined
  const presentation = resolveContentImagePresentationDefault(resolvePresentationSurface(frame))

  return (
    <div className={cn(contentMediaImageFrameVariants({ frame }), className)}>
      <img
        src={display.src}
        alt={alt}
        className={cn(
          contentMediaImageClasses,
          frame === 'builderCard' && contentMediaImageBuilderBlendClasses,
        )}
        style={
          cropLayout
            ? {
                width: `${cropLayout.widthPercent}%`,
                height: `${cropLayout.heightPercent}%`,
                marginLeft: `${cropLayout.offsetXPercent}%`,
                marginTop: `${cropLayout.offsetYPercent}%`,
              }
            : {
                objectFit: presentation.objectFit,
                objectPosition: presentation.objectPosition,
              }
        }
      />
    </div>
  )
}
