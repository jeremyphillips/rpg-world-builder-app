import type { NormalizedCrop, NormalizedFocalPoint, SourceDimensions } from './geometry'
import type { ImagePresentation } from './image-presentation'
import { canonicalizeEmblemPresentation, isDefaultEmblemPresentation } from './emblem-layout'
import type { MediaRole } from './roles'
import {
  asContainPresentation,
  asCropPresentation,
  createDefaultRolePresentation,
} from './role-presentation'

const PIXEL_TOLERANCE = 1

function toSourcePx(value: number, dimension: number): number {
  return value * dimension
}

function focalPointsEqual(
  left: NormalizedFocalPoint | undefined,
  right: NormalizedFocalPoint | undefined,
  source: SourceDimensions,
): boolean {
  if (!left && !right) return true
  if (!left || !right) return false
  return (
    Math.abs(toSourcePx(left.x, source.width) - toSourcePx(right.x, source.width)) <=
      PIXEL_TOLERANCE &&
    Math.abs(toSourcePx(left.y, source.height) - toSourcePx(right.y, source.height)) <=
      PIXEL_TOLERANCE
  )
}

function cropsEqual(
  left: NormalizedCrop,
  right: NormalizedCrop,
  source: SourceDimensions,
): boolean {
  return (
    Math.abs(toSourcePx(left.x, source.width) - toSourcePx(right.x, source.width)) <=
      PIXEL_TOLERANCE &&
    Math.abs(toSourcePx(left.y, source.height) - toSourcePx(right.y, source.height)) <=
      PIXEL_TOLERANCE &&
    Math.abs(toSourcePx(left.width, source.width) - toSourcePx(right.width, source.width)) <=
      PIXEL_TOLERANCE &&
    Math.abs(toSourcePx(left.height, source.height) - toSourcePx(right.height, source.height)) <=
      PIXEL_TOLERANCE
  )
}

/** Whether a role presentation differs from the role default for the given source. */
export function isRolePresentationCustomized(input: {
  role: MediaRole
  presentation: ImagePresentation | undefined
  source: SourceDimensions
}): boolean {
  const { role, presentation, source } = input
  if (!presentation) return false

  if (role === 'emblem') {
    const current = asContainPresentation(presentation)
    if (!current) return false
    return !isDefaultEmblemPresentation(canonicalizeEmblemPresentation(source, current))
  }

  const currentCrop = asCropPresentation(presentation)
  if (!currentCrop?.crop) return false

  const defaultCrop = asCropPresentation(createDefaultRolePresentation(role, source))
  if (!defaultCrop?.crop) return true

  if (!cropsEqual(currentCrop.crop, defaultCrop.crop, source)) return true
  return !focalPointsEqual(currentCrop.focalPoint, defaultCrop.focalPoint, source)
}

export function resolveMediaRolePresentationNoun(role: MediaRole): 'crop' | 'size and position' {
  return role === 'emblem' ? 'size and position' : 'crop'
}
