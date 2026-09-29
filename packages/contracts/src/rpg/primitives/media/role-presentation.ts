import type { ContainPresentation, CropPresentation, ImagePresentation } from './image-presentation'
import { focalPointFromCropCenter, resetFixedAspectCrop, type SourceDimensions } from './geometry'
import { getFixedAspectCropSpec } from './role-crop-spec'
import type { MediaRole } from './roles'

/** Default presentation seeded when a role is first assigned to an image. */
export function createDefaultRolePresentation(
  role: MediaRole,
  source: SourceDimensions,
): ImagePresentation {
  if (role === 'emblem') {
    return defaultEmblemPresentation()
  }

  const spec = getFixedAspectCropSpec(role)
  if (!spec) {
    return { mode: 'crop' }
  }

  const crop = resetFixedAspectCrop(source, spec)
  const cropPresentation: CropPresentation = { mode: 'crop', crop }

  if (spec.supportsFocalPoint) {
    return {
      ...cropPresentation,
      focalPoint: focalPointFromCropCenter(crop),
    }
  }

  return cropPresentation
}

export function defaultEmblemPresentation(): ContainPresentation {
  return { mode: 'contain', scale: 1 }
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
