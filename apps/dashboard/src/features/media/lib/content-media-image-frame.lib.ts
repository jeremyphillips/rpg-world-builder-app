import {
  deriveFrameCropWithinRoleCrop,
  getFixedAspectCropSpec,
  type ContentDisplayImage,
  type MediaRole,
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

export type FrameCropCompatibilityResult = {
  display: ContentDisplayImage
  renderMode: ContentMediaImageRenderMode
}

function resolveRoleAspectRatio(role: MediaRole): number | undefined {
  const spec = getFixedAspectCropSpec(role)
  if (!spec) return undefined
  return spec.aspectWidth / spec.aspectHeight
}

function rejectIncompatibleRoleCrop(
  display: ContentDisplayImage,
  frame: ContentMediaImageFrame,
): FrameCropCompatibilityResult {
  const message = `Frame "${frame}" does not accept role crop "${display.role}".`
  if (shouldEnforceFrameCropCompatibility()) {
    throw new Error(message)
  }
  return {
    display: { ...display, crop: undefined },
    renderMode: 'cover',
  }
}

function resolveCropPresentationForFrame(
  display: ContentDisplayImage,
  frame: ContentMediaImageFrame,
): FrameCropCompatibilityResult {
  const roleCrop = display.crop!
  const roleAspectRatio = resolveRoleAspectRatio(display.role)
  const frameAspectRatio = resolveFrameAspectRatio(frame)

  if (roleAspectRatio == null || frameAspectRatio == null) {
    return { display, renderMode: 'cover' }
  }

  const frameCrop = deriveFrameCropWithinRoleCrop(
    roleCrop,
    roleAspectRatio,
    frameAspectRatio,
    display.focalPoint,
  )

  return {
    display: { ...display, crop: frameCrop },
    renderMode: 'crop',
  }
}

/** Map saved role presentation to frame-compatible crop or cover presentation. */
export function resolveFrameCropCompatibility(
  display: ContentDisplayImage,
  frame: ContentMediaImageFrame,
): FrameCropCompatibilityResult {
  if (frame === 'emblem' || frame === 'emblemHero') {
    return { display, renderMode: 'contain' }
  }

  if (display.crop != null) {
    if (!frameAcceptsRoleCrop(frame, display.role)) {
      if (resolveFrameAcceptedCropRoles(frame).length === 0) {
        return { display: { ...display, crop: undefined }, renderMode: 'cover' }
      }
      return rejectIncompatibleRoleCrop(display, frame)
    }
    return resolveCropPresentationForFrame(display, frame)
  }

  return { display, renderMode: 'cover' }
}

export function resolveFocalObjectPosition(
  focalPoint: ContentDisplayImage['focalPoint'],
): string | undefined {
  if (!focalPoint) return undefined
  return `${focalPoint.x * 100}% ${focalPoint.y * 100}%`
}
