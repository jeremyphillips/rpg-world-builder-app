import { cn, ContentDisplayFallbackIcon } from '@rpg/ui'
import {
  resolveNormalizedCropImageLayout,
  type ContentDisplayFallback,
  type ContentDisplayImage,
} from '@rpg/contracts'

import {
  resolveContentImagePresentationDefault,
  type ContentImagePresentationSurface,
} from '@/features/content/lib/detail/page/content-image-presentation-defaults'
import {
  contentMediaImageClasses,
  contentMediaImageFallbackIconClasses,
  contentMediaImageFallbackWellClasses,
  contentMediaImageFrameVariants,
  contentMediaImageWhitePaperKnockoutClasses,
  type ContentMediaImageFrame,
} from './content-media-image.variants'

export type { ContentMediaImageFrame }

export type ContentMediaImageProps = {
  display: ContentDisplayImage
  alt: string
  frame?: ContentMediaImageFrame
  className?: string
}

export type ContentMediaFallbackProps = {
  fallback: ContentDisplayFallback
  frame?: ContentMediaImageFrame
  className?: string
}

function resolvePresentationSurface(
  frame: ContentMediaImageFrame,
): ContentImagePresentationSurface {
  if (frame === 'square' || frame === 'insetSm') return 'thumbnail'
  if (frame === 'builderCard') return 'builderCard'
  if (frame === 'builderSheetHero') return 'primary'
  return 'primary'
}

function usesNormalizedCropLayout(frame: ContentMediaImageFrame, hasCrop: boolean): boolean {
  if (frame === 'primary' || frame === 'builderSheetHero') return true
  if (hasCrop && (frame === 'builderCard' || frame === 'square' || frame === 'insetSm')) {
    return true
  }
  return false
}

/** Renders a resolved display image with optional normalized-crop math. */
export function ContentMediaImage({
  display,
  alt,
  frame = 'intrinsic',
  className,
}: ContentMediaImageProps) {
  const hasCrop = display.crop != null
  const applyCropLayout = usesNormalizedCropLayout(frame, hasCrop)
  const cropLayout =
    applyCropLayout && display.crop ? resolveNormalizedCropImageLayout(display.crop) : undefined
  const presentation = resolveContentImagePresentationDefault(resolvePresentationSurface(frame))
  const usesWhitePaperKnockout = display.presentationTreatment === 'white-paper-knockout'

  return (
    <div className={cn(contentMediaImageFrameVariants({ frame }), className)}>
      <img
        src={display.src}
        alt={alt}
        className={cn(
          contentMediaImageClasses,
          usesWhitePaperKnockout && contentMediaImageWhitePaperKnockoutClasses,
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

/** Semantic fallback in the same aspect frame as {@link ContentMediaImage} for a surface. */
export function ContentMediaFallback({
  fallback,
  frame = 'intrinsic',
  className,
}: ContentMediaFallbackProps) {
  return (
    <div
      className={cn(contentMediaImageFrameVariants({ frame }), className)}
      aria-hidden
      data-content-media-fallback={fallback}
    >
      <div className={contentMediaImageFallbackWellClasses}>
        <ContentDisplayFallbackIcon
          fallback={fallback}
          size="sm"
          className={contentMediaImageFallbackIconClasses[frame]}
        />
      </div>
    </div>
  )
}
