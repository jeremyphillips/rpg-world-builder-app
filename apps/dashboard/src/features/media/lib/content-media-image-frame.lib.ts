import type { ContentDisplayImage, MediaRole } from '@rpg/contracts'

import type { ContentMediaImageFrame } from '../components/content-media-image.variants'

export type ContentMediaImageRenderMode = 'crop' | 'cover' | 'contain'

/** Roles whose saved crop may be applied on this frame. Empty means cover-only (no role crop). */
export function resolveFrameAcceptedCropRoles(frame: ContentMediaImageFrame): readonly MediaRole[] {
  if (frame === 'square' || frame === 'insetSm') return ['portrait', 'primary']
  if (frame === 'primary' || frame === 'builderSheetHero') return ['primary']
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

/** Drop saved crops that do not match the frame's role contract; fail in dev/test. */
export function resolveFrameCropCompatibility(
  display: ContentDisplayImage,
  frame: ContentMediaImageFrame,
): FrameCropCompatibilityResult {
  if (frame === 'emblem' || frame === 'emblemHero') {
    return { display, renderMode: 'contain' }
  }

  const acceptedCropRoles = resolveFrameAcceptedCropRoles(frame)

  if (acceptedCropRoles.length === 0) {
    if (display.crop != null) {
      const message = `Frame "${frame}" does not accept role crop "${display.role}".`
      if (shouldEnforceFrameCropCompatibility()) {
        throw new Error(message)
      }
      return {
        display: { ...display, crop: undefined },
        renderMode: 'cover',
      }
    }
    return { display, renderMode: 'cover' }
  }

  if (display.crop != null && !frameAcceptsRoleCrop(frame, display.role)) {
    const message = `Frame "${frame}" does not accept role crop "${display.role}".`
    if (shouldEnforceFrameCropCompatibility()) {
      throw new Error(message)
    }
    return {
      display: { ...display, crop: undefined },
      renderMode: 'cover',
    }
  }

  if (display.crop != null && frameAcceptsRoleCrop(frame, display.role)) {
    return { display, renderMode: 'crop' }
  }

  return { display, renderMode: 'cover' }
}

export function resolveFocalObjectPosition(
  focalPoint: ContentDisplayImage['focalPoint'],
): string | undefined {
  if (!focalPoint) return undefined
  return `${focalPoint.x * 100}% ${focalPoint.y * 100}%`
}
