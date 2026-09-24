import { z } from 'zod'

import type { CropPresentation } from './image-presentation'
import {
  CONTENT_MEDIA_BANNER_ASPECT_RATIO,
  CONTENT_MEDIA_BANNER_ASPECT_TOLERANCE_PX,
  CONTENT_MEDIA_BANNER_MIN_HEIGHT_PX,
  CONTENT_MEDIA_BANNER_MIN_WIDTH_PX,
  CONTENT_MEDIA_EMBLEM_MIN_EDGE_PX,
  CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX,
  CONTENT_MEDIA_PORTRAIT_SQUARE_TOLERANCE_PX,
  CONTENT_MEDIA_PRIMARY_MIN_SHORT_SIDE_PX,
} from './limits'
import type { MediaRole } from './roles'

/** Normalized crop rectangle against the EXIF-oriented display source. */
export const normalizedCropSchema = z
  .object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    width: z.number().positive().max(1),
    height: z.number().positive().max(1),
  })
  .superRefine((crop, ctx) => {
    if (crop.x + crop.width > 1 + Number.EPSILON) {
      ctx.addIssue({
        code: 'custom',
        message: 'Crop width extends beyond the source image.',
        path: ['width'],
      })
    }
    if (crop.y + crop.height > 1 + Number.EPSILON) {
      ctx.addIssue({
        code: 'custom',
        message: 'Crop height extends beyond the source image.',
        path: ['height'],
      })
    }
  })

export type NormalizedCrop = z.infer<typeof normalizedCropSchema>

/** Optional normalized focal point stored in source space. */
export const normalizedFocalPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
})

export type NormalizedFocalPoint = z.infer<typeof normalizedFocalPointSchema>

export type SourceDimensions = {
  width: number
  height: number
}

export type PanZoomState = {
  sourceWidth: number
  sourceHeight: number
  viewportSize: number
  zoom: number
  panX: number
  panY: number
}

export type MediaRoleEligibility =
  | { eligible: true; hint?: string }
  | { eligible: false; message: string; hint?: string }

/** Largest centered square crop for a source, expressed in normalized coordinates. */
export function resetPortraitCrop(source: SourceDimensions): NormalizedCrop {
  const { width, height } = source
  if (width <= 0 || height <= 0) {
    throw new Error('Source dimensions must be positive.')
  }

  const squarePx = Math.min(width, height)
  const widthNorm = squarePx / width
  const heightNorm = squarePx / height
  const x = (1 - widthNorm) / 2
  const y = (1 - heightNorm) / 2

  return { x, y, width: widthNorm, height: heightNorm }
}

/** Full-frame crop for primary artwork. */
export function resetPrimaryCrop(): NormalizedCrop {
  return { x: 0, y: 0, width: 1, height: 1 }
}

/** Pixel dimensions of the widest 3:1 crop that fits inside the source. */
export function widestBannerCropDimensions(source: SourceDimensions): {
  cropW: number
  cropH: number
} {
  const { width, height } = source
  const sourceAspect = width / height

  if (sourceAspect >= CONTENT_MEDIA_BANNER_ASPECT_RATIO) {
    const cropH = height
    const cropW = Math.min(width, CONTENT_MEDIA_BANNER_ASPECT_RATIO * height)
    return { cropW, cropH }
  }

  const cropW = width
  const cropH = cropW / CONTENT_MEDIA_BANNER_ASPECT_RATIO
  return { cropW, cropH: Math.min(cropH, height) }
}

/** Largest centered 3:1 crop for a source, expressed in normalized coordinates. */
export function resetBannerCrop(source: SourceDimensions): NormalizedCrop {
  const { width, height } = source
  if (width <= 0 || height <= 0) {
    throw new Error('Source dimensions must be positive.')
  }

  const { cropW, cropH } = widestBannerCropDimensions(source)
  const widthNorm = cropW / width
  const heightNorm = cropH / height
  const x = (1 - widthNorm) / 2
  const y = (1 - heightNorm) / 2

  return { x, y, width: widthNorm, height: heightNorm }
}

/** Source-space focal point at the center of a normalized crop rectangle. */
export function focalPointFromCropCenter(crop: NormalizedCrop): NormalizedFocalPoint {
  return {
    x: crop.x + crop.width / 2,
    y: crop.y + crop.height / 2,
  }
}

/** Convert transient pan/zoom editor state into a normalized crop rectangle. */
export function cropFromPanZoom(state: PanZoomState): NormalizedCrop {
  const { sourceWidth, sourceHeight, viewportSize, zoom, panX, panY } = state
  if (sourceWidth <= 0 || sourceHeight <= 0 || viewportSize <= 0 || zoom <= 0) {
    throw new Error('Pan/zoom state requires positive source and viewport dimensions.')
  }

  const displayedWidth = sourceWidth * zoom
  const displayedHeight = sourceHeight * zoom
  const cropPx = viewportSize / zoom
  const maxPanX = Math.max(0, displayedWidth - viewportSize)
  const maxPanY = Math.max(0, displayedHeight - viewportSize)
  const clampedPanX = clamp(panX, 0, maxPanX)
  const clampedPanY = clamp(panY, 0, maxPanY)

  const xPx = clampedPanX / zoom
  const yPx = clampedPanY / zoom

  return {
    x: xPx / sourceWidth,
    y: yPx / sourceHeight,
    width: cropPx / sourceWidth,
    height: cropPx / sourceHeight,
  }
}

/** Resolve the effective crop: explicit crop wins, then focal point, then the role default. */
export function resolveEffectiveCrop(
  presentation: CropPresentation | undefined,
  source: SourceDimensions,
  defaultCrop: () => NormalizedCrop = () => resetPortraitCrop(source),
): NormalizedCrop {
  if (presentation?.crop) {
    return presentation.crop
  }

  if (presentation?.focalPoint) {
    return cropFromFocalPoint(presentation.focalPoint, source, defaultCrop())
  }

  return defaultCrop()
}

/** Build a square crop centered on a focal point, clamped to source bounds. */
export function cropFromFocalPoint(
  focalPoint: NormalizedFocalPoint,
  source: SourceDimensions,
  base: NormalizedCrop = resetPortraitCrop(source),
): NormalizedCrop {
  const focalX = focalPoint.x * source.width
  const focalY = focalPoint.y * source.height
  const half = (base.width * source.width) / 2

  let xPx = focalX - half
  let yPx = focalY - half
  const sizePx = base.width * source.width

  xPx = clamp(xPx, 0, source.width - sizePx)
  yPx = clamp(yPx, 0, source.height - sizePx)

  return {
    x: xPx / source.width,
    y: yPx / source.height,
    width: base.width,
    height: base.height,
  }
}

/** Whether the crop produces a square region within the configured pixel tolerance. */
export function isSquareCrop(
  crop: NormalizedCrop,
  source: SourceDimensions,
  tolerancePx = CONTENT_MEDIA_PORTRAIT_SQUARE_TOLERANCE_PX,
): boolean {
  const cropWidthPx = crop.width * source.width
  const cropHeightPx = crop.height * source.height
  return Math.abs(cropWidthPx - cropHeightPx) <= tolerancePx
}

/** Whether the crop meets the minimum Portrait edge requirement. */
export function meetsPortraitMinimumCrop(
  crop: NormalizedCrop,
  source: SourceDimensions,
  minEdgePx = CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX,
): boolean {
  const cropWidthPx = crop.width * source.width
  const cropHeightPx = crop.height * source.height
  return Math.min(cropWidthPx, cropHeightPx) >= minEdgePx
}

/** Whether the crop is 3:1 within the configured pixel tolerance. */
export function isBannerAspectCrop(
  crop: NormalizedCrop,
  source: SourceDimensions,
  tolerancePx = CONTENT_MEDIA_BANNER_ASPECT_TOLERANCE_PX,
): boolean {
  const cropWidthPx = crop.width * source.width
  const cropHeightPx = crop.height * source.height
  const expectedHeight = cropWidthPx / CONTENT_MEDIA_BANNER_ASPECT_RATIO
  return Math.abs(cropHeightPx - expectedHeight) <= tolerancePx
}

/** Whether the crop meets the minimum Banner size requirement. */
export function meetsBannerMinimumCrop(crop: NormalizedCrop, source: SourceDimensions): boolean {
  const cropWidthPx = crop.width * source.width
  const cropHeightPx = crop.height * source.height
  return (
    cropWidthPx >= CONTENT_MEDIA_BANNER_MIN_WIDTH_PX &&
    cropHeightPx >= CONTENT_MEDIA_BANNER_MIN_HEIGHT_PX
  )
}

/** Whether the crop meets the minimum Primary short-edge requirement. */
export function meetsPrimaryMinimumCrop(
  crop: NormalizedCrop,
  source: SourceDimensions,
  minShortSidePx = CONTENT_MEDIA_PRIMARY_MIN_SHORT_SIDE_PX,
): boolean {
  const cropWidthPx = crop.width * source.width
  const cropHeightPx = crop.height * source.height
  return Math.min(cropWidthPx, cropHeightPx) >= minShortSidePx
}

/** Whether the source meets the minimum Emblem edge requirement. */
export function meetsEmblemMinimumEdge(
  source: SourceDimensions,
  minEdgePx = CONTENT_MEDIA_EMBLEM_MIN_EDGE_PX,
): boolean {
  return Math.min(source.width, source.height) >= minEdgePx
}

/** Whether a source-space focal point lies inside a normalized crop rectangle. */
export function isFocalPointInCrop(
  focalPoint: NormalizedFocalPoint,
  crop: NormalizedCrop,
): boolean {
  return (
    focalPoint.x >= crop.x &&
    focalPoint.x <= crop.x + crop.width &&
    focalPoint.y >= crop.y &&
    focalPoint.y <= crop.y + crop.height
  )
}

function defaultCropForRole(role: MediaRole, source: SourceDimensions): NormalizedCrop {
  switch (role) {
    case 'portrait':
      return resetPortraitCrop(source)
    case 'banner':
      return resetBannerCrop(source)
    case 'primary':
      return resetPrimaryCrop()
    default:
      return resetPrimaryCrop()
  }
}

function portraitRoleEligibility(source: SourceDimensions): MediaRoleEligibility {
  const { width, height } = source
  if (Math.min(width, height) < CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX) {
    return {
      eligible: false,
      message: `Requires at least ${CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX} × ${CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX} pixels; this image is ${width} × ${height}.`,
    }
  }
  return { eligible: true }
}

function bannerRoleEligibility(
  source: SourceDimensions,
  presentation?: CropPresentation,
): MediaRoleEligibility {
  const { width, height } = source
  const { cropW, cropH } = widestBannerCropDimensions(source)
  if (cropW < CONTENT_MEDIA_BANNER_MIN_WIDTH_PX || cropH < CONTENT_MEDIA_BANNER_MIN_HEIGHT_PX) {
    return {
      eligible: false,
      message: `Banner needs a 3:1 crop at least ${CONTENT_MEDIA_BANNER_MIN_WIDTH_PX} × ${CONTENT_MEDIA_BANNER_MIN_HEIGHT_PX} pixels. This image is ${width} × ${height}, so its widest 3:1 crop is ${Math.round(cropW)} × ${Math.round(cropH)}.`,
    }
  }
  const crop = presentation?.crop
  if (crop && (!isBannerAspectCrop(crop, source) || !meetsBannerMinimumCrop(crop, source))) {
    return {
      eligible: false,
      message: `Banner crop must be 3:1 and at least ${CONTENT_MEDIA_BANNER_MIN_WIDTH_PX} × ${CONTENT_MEDIA_BANNER_MIN_HEIGHT_PX} pixels.`,
    }
  }
  return { eligible: true }
}

function primaryRoleEligibility(
  source: SourceDimensions,
  presentation?: CropPresentation,
): MediaRoleEligibility {
  const { width, height } = source
  const crop = presentation?.crop ?? resetPrimaryCrop()
  if (!meetsPrimaryMinimumCrop(crop, source)) {
    return {
      eligible: false,
      message: `Primary image needs a crop at least ${CONTENT_MEDIA_PRIMARY_MIN_SHORT_SIDE_PX} pixels on its shorter side. This image is ${width} × ${height}.`,
    }
  }
  return { eligible: true }
}

function emblemRoleEligibility(source: SourceDimensions): MediaRoleEligibility {
  const { width, height } = source
  if (!meetsEmblemMinimumEdge(source)) {
    return {
      eligible: false,
      message: `Emblem needs an image at least ${CONTENT_MEDIA_EMBLEM_MIN_EDGE_PX} × ${CONTENT_MEDIA_EMBLEM_MIN_EDGE_PX} pixels. This image is ${width} × ${height}.`,
    }
  }
  return {
    eligible: true,
    hint: 'PNG or WebP keeps a transparent background.',
  }
}

const ROLE_ELIGIBILITY: Record<
  MediaRole,
  (source: SourceDimensions, presentation?: CropPresentation) => MediaRoleEligibility
> = {
  portrait: (source) => portraitRoleEligibility(source),
  banner: (source, presentation) => bannerRoleEligibility(source, presentation),
  primary: (source, presentation) => primaryRoleEligibility(source, presentation),
  emblem: (source) => emblemRoleEligibility(source),
}

/** Shared eligibility for role assignment controls and validation. */
export function resolveMediaRoleEligibility(
  role: MediaRole,
  source: SourceDimensions,
  presentation?: CropPresentation,
): MediaRoleEligibility {
  return ROLE_ELIGIBILITY[role](source, presentation)
}

export function resolveDefaultCropForRole(
  role: MediaRole,
  source: SourceDimensions,
): NormalizedCrop {
  return defaultCropForRole(role, source)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
