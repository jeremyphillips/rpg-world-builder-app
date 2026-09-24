import { z } from 'zod'

import { contentMediaValidationMessages } from './content-media-validation-messages'
import type { CropPresentation } from './image-presentation'
import {
  CONTENT_MEDIA_BANNER_ASPECT_RATIO,
  CONTENT_MEDIA_BANNER_ASPECT_TOLERANCE_PX,
  CONTENT_MEDIA_EMBLEM_MIN_EDGE_PX,
  CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX,
  CONTENT_MEDIA_PORTRAIT_SQUARE_TOLERANCE_PX,
} from './limits'
import {
  formatAspectRatioLabel,
  getFixedAspectCropSpec,
  getMediaRoleCropSpec,
  type FixedAspectCropSpec,
} from './role-crop-spec'
import { MEDIA_ROLE_ENTRIES, type MediaRole } from './roles'

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

export type NormalizedCropImageLayout = {
  widthPercent: number
  heightPercent: number
  offsetXPercent: number
  offsetYPercent: number
}

/** Map a normalized crop to percentage offsets for object-fit display math. */
export function resolveNormalizedCropImageLayout(crop: NormalizedCrop): NormalizedCropImageLayout {
  return {
    widthPercent: 100 / crop.width,
    heightPercent: 100 / crop.height,
    offsetXPercent: -(crop.x / crop.width) * 100,
    offsetYPercent: -(crop.y / crop.height) * 100,
  }
}

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

/** Pixel dimensions of the widest crop with the given aspect ratio that fits inside the source. */
export function widestFixedAspectCropDimensions(
  source: SourceDimensions,
  aspectRatio: number,
): {
  cropW: number
  cropH: number
} {
  const { width, height } = source
  const sourceAspect = width / height

  if (sourceAspect >= aspectRatio) {
    const cropH = height
    const cropW = Math.min(width, aspectRatio * height)
    return { cropW, cropH }
  }

  const cropW = width
  const cropH = cropW / aspectRatio
  return { cropW, cropH: Math.min(cropH, height) }
}

/** Largest centered fixed-aspect crop for a source, expressed in normalized coordinates. */
export function resetFixedAspectCrop(
  source: SourceDimensions,
  spec: FixedAspectCropSpec,
): NormalizedCrop {
  const { width, height } = source
  if (width <= 0 || height <= 0) {
    throw new Error('Source dimensions must be positive.')
  }

  const aspectRatio = spec.aspectWidth / spec.aspectHeight
  const { cropW, cropH } = widestFixedAspectCropDimensions(source, aspectRatio)
  const widthNorm = cropW / width
  const heightNorm = cropH / height
  const x = (1 - widthNorm) / 2
  const y = (1 - heightNorm) / 2

  return { x, y, width: widthNorm, height: heightNorm }
}

/** Whether the crop matches the fixed aspect ratio within the configured pixel tolerance. */
export function isFixedAspectCrop(
  crop: NormalizedCrop,
  source: SourceDimensions,
  spec: FixedAspectCropSpec,
): boolean {
  const cropWidthPx = crop.width * source.width
  const cropHeightPx = crop.height * source.height
  const aspectRatio = spec.aspectWidth / spec.aspectHeight
  const expectedHeight = cropWidthPx / aspectRatio
  return Math.abs(cropHeightPx - expectedHeight) <= spec.aspectTolerancePx
}

/** Whether the crop meets the minimum fixed-aspect size requirement. */
export function meetsFixedAspectMinimum(
  crop: NormalizedCrop,
  source: SourceDimensions,
  spec: FixedAspectCropSpec,
): boolean {
  const cropWidthPx = crop.width * source.width
  const cropHeightPx = crop.height * source.height
  return cropWidthPx >= spec.minWidthPx && cropHeightPx >= spec.minHeightPx
}

/** Largest centered square crop for a source, expressed in normalized coordinates. */
export function resetPortraitCrop(source: SourceDimensions): NormalizedCrop {
  return resetFixedAspectCrop(source, getFixedAspectCropSpec('portrait')!)
}

/** Largest centered 4:3 crop for a source, expressed in normalized coordinates. */
export function resetPrimaryCrop(source: SourceDimensions): NormalizedCrop {
  return resetFixedAspectCrop(source, getFixedAspectCropSpec('primary')!)
}

/** Pixel dimensions of the widest 3:1 crop that fits inside the source. */
export function widestBannerCropDimensions(source: SourceDimensions): {
  cropW: number
  cropH: number
} {
  return widestFixedAspectCropDimensions(source, CONTENT_MEDIA_BANNER_ASPECT_RATIO)
}

/** Largest centered 3:1 crop for a source, expressed in normalized coordinates. */
export function resetBannerCrop(source: SourceDimensions): NormalizedCrop {
  return resetFixedAspectCrop(source, getFixedAspectCropSpec('banner')!)
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
  const spec = getFixedAspectCropSpec('portrait')!
  return isFixedAspectCrop(crop, source, { ...spec, aspectTolerancePx: tolerancePx })
}

/** Whether the crop meets the minimum Portrait edge requirement. */
export function meetsPortraitMinimumCrop(
  crop: NormalizedCrop,
  source: SourceDimensions,
  minEdgePx = CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX,
): boolean {
  const spec = getFixedAspectCropSpec('portrait')!
  return meetsFixedAspectMinimum(crop, source, {
    ...spec,
    minWidthPx: minEdgePx,
    minHeightPx: minEdgePx,
  })
}

/** Whether the crop is 3:1 within the configured pixel tolerance. */
export function isBannerAspectCrop(
  crop: NormalizedCrop,
  source: SourceDimensions,
  tolerancePx = CONTENT_MEDIA_BANNER_ASPECT_TOLERANCE_PX,
): boolean {
  const spec = getFixedAspectCropSpec('banner')!
  return isFixedAspectCrop(crop, source, { ...spec, aspectTolerancePx: tolerancePx })
}

/** Whether the crop meets the minimum Banner size requirement. */
export function meetsBannerMinimumCrop(crop: NormalizedCrop, source: SourceDimensions): boolean {
  return meetsFixedAspectMinimum(crop, source, getFixedAspectCropSpec('banner')!)
}

/** Whether the crop is 4:3 within the configured pixel tolerance. */
export function isPrimaryAspectCrop(crop: NormalizedCrop, source: SourceDimensions): boolean {
  return isFixedAspectCrop(crop, source, getFixedAspectCropSpec('primary')!)
}

/** Whether the crop meets the minimum Primary size requirement. */
export function meetsPrimaryMinimumCrop(crop: NormalizedCrop, source: SourceDimensions): boolean {
  return meetsFixedAspectMinimum(crop, source, getFixedAspectCropSpec('primary')!)
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
  const spec = getFixedAspectCropSpec(role)
  if (spec) {
    return resetFixedAspectCrop(source, spec)
  }
  return resetPrimaryCrop(source)
}

export function fixedAspectRoleEligibility(
  role: MediaRole,
  source: SourceDimensions,
  presentation?: CropPresentation,
): MediaRoleEligibility {
  const spec = getFixedAspectCropSpec(role)
  if (!spec) {
    throw new Error(`Role ${role} does not use fixed-aspect crop eligibility.`)
  }

  const { width, height } = source
  const aspectLabel = formatAspectRatioLabel(spec)
  const roleLabel = MEDIA_ROLE_ENTRIES[role].label
  const { cropW, cropH } = widestFixedAspectCropDimensions(
    source,
    spec.aspectWidth / spec.aspectHeight,
  )

  if (cropW < spec.minWidthPx || cropH < spec.minHeightPx) {
    return {
      eligible: false,
      message: contentMediaValidationMessages.fixedAspectSourceTooSmall({
        roleLabel,
        aspectLabel,
        minWidthPx: spec.minWidthPx,
        minHeightPx: spec.minHeightPx,
        sourceWidth: width,
        sourceHeight: height,
        widestCropWidth: Math.round(cropW),
        widestCropHeight: Math.round(cropH),
      }),
    }
  }

  const crop = presentation?.crop
  if (
    crop &&
    (!isFixedAspectCrop(crop, source, spec) || !meetsFixedAspectMinimum(crop, source, spec))
  ) {
    return {
      eligible: false,
      message: contentMediaValidationMessages.fixedAspectCropInvalid({
        roleLabel,
        aspectLabel,
        minWidthPx: spec.minWidthPx,
        minHeightPx: spec.minHeightPx,
      }),
    }
  }

  return { eligible: true }
}

function emblemRoleEligibility(source: SourceDimensions): MediaRoleEligibility {
  const { width, height } = source
  const emblemSpec = getMediaRoleCropSpec('emblem')
  if (emblemSpec.kind !== 'contain') {
    throw new Error('Emblem crop spec must use contain mode.')
  }
  const minEdgePx = emblemSpec.minEdgePx
  if (!meetsEmblemMinimumEdge(source, minEdgePx)) {
    return {
      eligible: false,
      message: contentMediaValidationMessages.emblemSourceTooSmall({
        minEdgePx,
        sourceWidth: width,
        sourceHeight: height,
      }),
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
  portrait: (source, presentation) => fixedAspectRoleEligibility('portrait', source, presentation),
  banner: (source, presentation) => fixedAspectRoleEligibility('banner', source, presentation),
  primary: (source, presentation) => fixedAspectRoleEligibility('primary', source, presentation),
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
