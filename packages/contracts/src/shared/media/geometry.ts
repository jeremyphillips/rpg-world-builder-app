import { z } from 'zod'

import {
  CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX,
  CONTENT_MEDIA_PORTRAIT_SQUARE_TOLERANCE_PX,
} from './limits'

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

/** Optional normalized focal point used only when no explicit crop exists. */
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

/** Resolve the effective crop: explicit crop wins, then focal point, then centered square. */
export function resolveEffectiveCrop(
  presentation: { crop?: NormalizedCrop; focalPoint?: NormalizedFocalPoint } | undefined,
  source: SourceDimensions,
): NormalizedCrop {
  if (presentation?.crop) {
    return presentation.crop
  }

  if (presentation?.focalPoint) {
    return cropFromFocalPoint(presentation.focalPoint, source)
  }

  return resetPortraitCrop(source)
}

/** Build a square crop centered on a focal point, clamped to source bounds. */
export function cropFromFocalPoint(
  focalPoint: NormalizedFocalPoint,
  source: SourceDimensions,
): NormalizedCrop {
  const base = resetPortraitCrop(source)
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
