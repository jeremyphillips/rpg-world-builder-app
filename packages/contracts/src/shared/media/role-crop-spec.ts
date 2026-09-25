import {
  CONTENT_MEDIA_BANNER_ASPECT_TOLERANCE_PX,
  CONTENT_MEDIA_BANNER_MIN_HEIGHT_PX,
  CONTENT_MEDIA_BANNER_MIN_WIDTH_PX,
  CONTENT_MEDIA_EMBLEM_MIN_EDGE_PX,
  CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX,
  CONTENT_MEDIA_PORTRAIT_SQUARE_TOLERANCE_PX,
  CONTENT_MEDIA_PRIMARY_ASPECT_HEIGHT,
  CONTENT_MEDIA_PRIMARY_ASPECT_TOLERANCE_PX,
  CONTENT_MEDIA_PRIMARY_ASPECT_WIDTH,
  CONTENT_MEDIA_PRIMARY_MIN_HEIGHT_PX,
  CONTENT_MEDIA_PRIMARY_MIN_WIDTH_PX,
} from './limits'
import type { MediaRole } from './roles'

export type FixedAspectCropSpec = {
  kind: 'fixed-aspect'
  aspectWidth: number
  aspectHeight: number
  minWidthPx: number
  minHeightPx: number
  aspectTolerancePx: number
  supportsFocalPoint: boolean
  showPortraitPreviews: boolean
}

export type ContainCropSpec = {
  kind: 'contain'
  minEdgePx: number
}

export type MediaRoleCropSpec = FixedAspectCropSpec | ContainCropSpec

export const MEDIA_ROLE_CROP_SPECS = {
  portrait: {
    kind: 'fixed-aspect',
    aspectWidth: 1,
    aspectHeight: 1,
    minWidthPx: CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX,
    minHeightPx: CONTENT_MEDIA_PORTRAIT_MIN_EDGE_PX,
    aspectTolerancePx: CONTENT_MEDIA_PORTRAIT_SQUARE_TOLERANCE_PX,
    supportsFocalPoint: false,
    showPortraitPreviews: true,
  },
  banner: {
    kind: 'fixed-aspect',
    aspectWidth: 3,
    aspectHeight: 1,
    minWidthPx: CONTENT_MEDIA_BANNER_MIN_WIDTH_PX,
    minHeightPx: CONTENT_MEDIA_BANNER_MIN_HEIGHT_PX,
    aspectTolerancePx: CONTENT_MEDIA_BANNER_ASPECT_TOLERANCE_PX,
    supportsFocalPoint: true,
    showPortraitPreviews: false,
  },
  primary: {
    kind: 'fixed-aspect',
    aspectWidth: CONTENT_MEDIA_PRIMARY_ASPECT_WIDTH,
    aspectHeight: CONTENT_MEDIA_PRIMARY_ASPECT_HEIGHT,
    minWidthPx: CONTENT_MEDIA_PRIMARY_MIN_WIDTH_PX,
    minHeightPx: CONTENT_MEDIA_PRIMARY_MIN_HEIGHT_PX,
    aspectTolerancePx: CONTENT_MEDIA_PRIMARY_ASPECT_TOLERANCE_PX,
    supportsFocalPoint: true,
    showPortraitPreviews: false,
  },
  emblem: {
    kind: 'contain',
    minEdgePx: CONTENT_MEDIA_EMBLEM_MIN_EDGE_PX,
  },
} satisfies Record<MediaRole, MediaRoleCropSpec>

export function getMediaRoleCropSpec(role: MediaRole): MediaRoleCropSpec {
  return MEDIA_ROLE_CROP_SPECS[role]
}

export function getFixedAspectCropSpec(role: MediaRole): FixedAspectCropSpec | undefined {
  const spec = MEDIA_ROLE_CROP_SPECS[role]
  return spec.kind === 'fixed-aspect' ? spec : undefined
}

export function formatAspectRatioLabel(spec: FixedAspectCropSpec): string {
  return `${spec.aspectWidth}:${spec.aspectHeight}`
}

export function fixedAspectRatio(spec: FixedAspectCropSpec): number {
  return spec.aspectWidth / spec.aspectHeight
}
