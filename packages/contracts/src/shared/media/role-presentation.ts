import type { ContainPresentation, CropPresentation, ImagePresentation } from './image-presentation'
import {
  focalPointFromCropCenter,
  resetBannerCrop,
  resetPrimaryCrop,
  type SourceDimensions,
} from './geometry'
import type { MediaRole } from './roles'

/** Default presentation seeded when a role is first assigned to an image. */
export function createDefaultRolePresentation(
  role: MediaRole,
  source: SourceDimensions,
): ImagePresentation {
  if (role === 'emblem') {
    return defaultEmblemPresentation()
  }

  const cropPresentation: CropPresentation = { mode: 'crop' }

  if (role === 'banner') {
    const crop = resetBannerCrop(source)
    return {
      mode: 'crop',
      crop,
      focalPoint: focalPointFromCropCenter(crop),
    }
  }

  if (role === 'primary') {
    return { mode: 'crop', crop: resetPrimaryCrop() }
  }

  return cropPresentation
}

export function defaultEmblemPresentation(): ContainPresentation {
  return { mode: 'contain', scale: 1, padding: 0 }
}

export function asCropPresentation(
  presentation: ImagePresentation | undefined,
): CropPresentation | undefined {
  if (!presentation || presentation.mode !== 'crop') return undefined
  return presentation
}

export function asContainPresentation(
  presentation: ImagePresentation | undefined,
): ContainPresentation | undefined {
  if (!presentation || presentation.mode !== 'contain') return undefined
  return presentation
}
