import {
  deriveFrameCropWithinRoleCrop,
  getFixedAspectCropSpec,
  type MediaRole,
  type NormalizedCrop,
  type NormalizedFocalPoint,
} from '@rpg/contracts'

import type { ContentMediaImageFrame } from '../components/content-media-image.variants'

export type ContentMediaImageRenderMode = 'crop' | 'cover' | 'contain'

/** Pixel width / height for each fixed-aspect frame (aligned with content-media-image.variants). */
export function resolveFrameAspectRatio(frame: ContentMediaImageFrame): number | undefined {
  if (frame === 'primary' || frame === 'builderSheetHero') return 4 / 3
  if (frame === 'builderCard') return 4 / 2
  if (frame === 'square' || frame === 'insetSm' || frame === 'emblem' || frame === 'emblemHero') {
    return 1
  }
  return undefined
}

/** Roles whose saved crop may be applied on this frame. Empty means cover-only (no role crop). */
export function resolveFrameAcceptedCropRoles(frame: ContentMediaImageFrame): readonly MediaRole[] {
  if (frame === 'square' || frame === 'insetSm') return ['portrait', 'primary']
  if (frame === 'primary' || frame === 'builderSheetHero' || frame === 'builderCard') {
    return ['primary']
  }
  return []
}

export function frameAcceptsRoleCrop(frame: ContentMediaImageFrame, role: MediaRole): boolean {
  if (frame === 'emblem' || frame === 'emblemHero') return role === 'emblem'
  return resolveFrameAcceptedCropRoles(frame).includes(role)
}

export function shouldEnforceFrameCropCompatibility(): boolean {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') return true
  return import.meta.env.DEV
}

export type FramePresentationInput = {
  role: MediaRole
  authoredCrop?: NormalizedCrop
  focalPoint?: NormalizedFocalPoint
  frame: ContentMediaImageFrame
}

export type FramePresentation = {
  mode: ContentMediaImageRenderMode
  effectiveCrop?: NormalizedCrop
}

function resolveRoleAspectRatio(role: MediaRole): number | undefined {
  const spec = getFixedAspectCropSpec(role)
  if (!spec) return undefined
  return spec.aspectWidth / spec.aspectHeight
}

function rejectIncompatibleRoleCrop(
  role: MediaRole,
  frame: ContentMediaImageFrame,
): FramePresentation {
  const message = `Frame "${frame}" does not accept role crop "${role}".`
  if (shouldEnforceFrameCropCompatibility()) {
    throw new Error(message)
  }
  return { mode: 'cover' }
}

/**
 * Resolve an ephemeral destination-frame presentation from authored role presentation.
 * `effectiveCrop` is render-only and must never replace the persisted authored crop.
 */
export function resolveFramePresentation(input: FramePresentationInput): FramePresentation {
  if (input.frame === 'emblem' || input.frame === 'emblemHero') {
    return { mode: 'contain' }
  }

  if (!input.authoredCrop) {
    return { mode: 'cover' }
  }

  if (!frameAcceptsRoleCrop(input.frame, input.role)) {
    if (resolveFrameAcceptedCropRoles(input.frame).length === 0) {
      return { mode: 'cover' }
    }
    return rejectIncompatibleRoleCrop(input.role, input.frame)
  }

  const roleAspectRatio = resolveRoleAspectRatio(input.role)
  const frameAspectRatio = resolveFrameAspectRatio(input.frame)
  if (roleAspectRatio == null || frameAspectRatio == null) {
    return { mode: 'cover' }
  }

  return {
    mode: 'crop',
    effectiveCrop: deriveFrameCropWithinRoleCrop(
      input.authoredCrop,
      roleAspectRatio,
      frameAspectRatio,
      input.focalPoint,
    ),
  }
}

export function resolveFocalObjectPosition(
  focalPoint: NormalizedFocalPoint | undefined,
): string | undefined {
  if (!focalPoint) return undefined
  return `${focalPoint.x * 100}% ${focalPoint.y * 100}%`
}
