import { useEffect } from 'react'
import {
  getFixedAspectCropSpec,
  isFixedAspectCrop,
  resetPrimaryCrop,
  resolveDefaultCropForRole,
  resolveEffectiveCrop,
  type CropPresentation,
  type MediaRole,
  type NormalizedCrop,
  type SourceDimensions,
} from '@rpg/contracts'

import type { MediaManagerController } from '../hooks/use-media-manager'

export function isStalePrimaryCrop(
  role: MediaRole,
  source: SourceDimensions,
  cropPresentation: CropPresentation | undefined,
): boolean {
  if (role !== 'primary' || !cropPresentation?.crop) return false
  const primarySpec = getFixedAspectCropSpec('primary')
  return primarySpec ? !isFixedAspectCrop(cropPresentation.crop, source, primarySpec) : false
}

export function resolveWorkspaceEditorCrop(input: {
  role: MediaRole
  source: SourceDimensions
  cropPresentation: CropPresentation | undefined
  stalePrimaryCrop: boolean
}): NormalizedCrop {
  if (input.stalePrimaryCrop) return resetPrimaryCrop(input.source)
  return resolveEffectiveCrop(input.cropPresentation, input.source, () =>
    resolveDefaultCropForRole(input.role, input.source),
  )
}

export function useCorrectStalePrimaryCrop(input: {
  dispatch: MediaManagerController['dispatch']
  stalePrimaryCrop: boolean
  isActiveForSelection: boolean
  source: SourceDimensions
  focalPoint: CropPresentation['focalPoint']
}) {
  useEffect(() => {
    if (!input.stalePrimaryCrop || !input.isActiveForSelection) return
    input.dispatch({
      type: 'crop',
      crop: resetPrimaryCrop(input.source),
      focalPoint: input.focalPoint,
    })
  }, [
    input.stalePrimaryCrop,
    input.isActiveForSelection,
    input.dispatch,
    input.source,
    input.focalPoint,
  ])
}
