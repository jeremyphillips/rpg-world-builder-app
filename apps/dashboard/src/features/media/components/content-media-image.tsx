import { cn, ContentDisplayFallbackIcon } from '@rpg/ui'
import {
  resolveNormalizedCropImageLayout,
  type ContentDisplayFallback,
  type ContentDisplayImage,
} from '@rpg/contracts'

import {
  resolveContentImagePresentationDefault,
  type ContentImagePresentationSurface,
} from '@/features/content'
import {
  resolveFramePresentation,
  resolveFocalObjectPosition,
} from '../lib/content-media-image-frame.lib'
import {
  contentMediaImageCoverClasses,
  contentMediaImageCropClasses,
  contentMediaImageFallbackIconClasses,
  contentMediaImageFallbackWellClasses,
  contentMediaImageFrameVariants,
  contentMediaImageEmblemClasses,
  contentMediaImageMonoGlyphInvertClasses,
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

function resolveCoverObjectPosition(
  display: ContentDisplayImage,
  frame: ContentMediaImageFrame,
): string {
  return (
    resolveFocalObjectPosition(display.focalPoint) ??
    resolveContentImagePresentationDefault(resolvePresentationSurface(frame)).objectPosition
  )
}

/** Renders a resolved display image with frame-aware crop or cover presentation. */
export function ContentMediaImage({
  display,
  alt,
  frame = 'intrinsic',
  className,
}: ContentMediaImageProps) {
  const presentation = resolveFramePresentation({
    role: display.role,
    authoredCrop: display.crop,
    focalPoint: display.focalPoint,
    frame,
  })
  const compatibleDisplay = { ...display, crop: presentation.effectiveCrop }
  const renderMode = presentation.mode
  const cropLayout =
    renderMode === 'crop' && compatibleDisplay.crop
      ? resolveNormalizedCropImageLayout(compatibleDisplay.crop)
      : undefined
  const usesWhitePaperKnockout = compatibleDisplay.presentationTreatment === 'white-paper-knockout'
  const usesMonoGlyphInvert = compatibleDisplay.presentationTreatment === 'mono-glyph-invert'

  const imageClassName = cn(
    renderMode === 'crop'
      ? contentMediaImageCropClasses
      : renderMode === 'contain'
        ? contentMediaImageEmblemClasses
        : contentMediaImageCoverClasses,
    usesWhitePaperKnockout && contentMediaImageWhitePaperKnockoutClasses,
    usesMonoGlyphInvert && contentMediaImageMonoGlyphInvertClasses,
  )

  return (
    <div className={cn(contentMediaImageFrameVariants({ frame }), className)}>
      <img
        src={compatibleDisplay.src}
        alt={alt}
        className={imageClassName}
        style={
          cropLayout
            ? {
                width: `${cropLayout.widthPercent}%`,
                height: `${cropLayout.heightPercent}%`,
                marginLeft: `${cropLayout.offsetXPercent}%`,
                marginTop: `${cropLayout.offsetYPercent}%`,
              }
            : renderMode === 'cover'
              ? { objectPosition: resolveCoverObjectPosition(compatibleDisplay, frame) }
              : undefined
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
