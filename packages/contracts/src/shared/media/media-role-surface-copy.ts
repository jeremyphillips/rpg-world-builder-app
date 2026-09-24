import {
  formatAspectRatioLabel,
  getFixedAspectCropSpec,
  type FixedAspectCropSpec,
} from './role-crop-spec'
import type { MediaRole } from './roles'

type MediaRoleSurfaceCopy = {
  positionLabel: string
  instructions: string
  workspaceHeading: string
  workspaceDescription: string
  switchLabel: string
}

const bannerSpec = getFixedAspectCropSpec('banner')!
const primarySpec = getFixedAspectCropSpec('primary')!

export const mediaRoleSurfaceCopy = {
  portrait: {
    positionLabel: 'Portrait crop position',
    instructions: 'Drag to reposition.',
    workspaceHeading: 'Portrait crop',
    workspaceDescription: 'Crop a square portrait for character cards, lists, and tokens.',
    switchLabel: 'Portrait',
  },
  banner: {
    positionLabel: 'Banner crop position',
    instructions: 'Drag to reposition. Move the focal point to adjust focus.',
    workspaceHeading: 'Banner crop',
    workspaceDescription: `Crop a wide ${formatAspectRatioLabel(bannerSpec)} image for campaign headers.`,
    switchLabel: 'Banner',
  },
  primary: {
    positionLabel: 'Primary crop position',
    instructions: 'Drag to reposition. Move the focal point to adjust focus.',
    workspaceHeading: 'Primary crop',
    workspaceDescription: `Crop a ${formatAspectRatioLabel(primarySpec)} image for representative artwork and detail views.`,
    switchLabel: 'Primary',
  },
  emblem: {
    positionLabel: 'Emblem layout',
    instructions: 'Drag to reposition.',
    workspaceHeading: 'Emblem',
    workspaceDescription: "Adjust how the emblem appears inside its frame. It won't be cropped.",
    switchLabel: 'Emblem',
  },
} satisfies Record<MediaRole, MediaRoleSurfaceCopy>

export function resolveMediaCropEditorConstraint(role: MediaRole):
  | {
      aspectRatio: number
      minWidthPx: number
      minHeightPx: number
      positionLabel: string
      instructions: string
      showPortraitPreviews: boolean
      spec: FixedAspectCropSpec
    }
  | undefined {
  const spec = getFixedAspectCropSpec(role)
  if (!spec) return undefined

  const copy = mediaRoleSurfaceCopy[role]
  return {
    aspectRatio: spec.aspectWidth / spec.aspectHeight,
    minWidthPx: spec.minWidthPx,
    minHeightPx: spec.minHeightPx,
    positionLabel: copy.positionLabel,
    instructions: copy.instructions,
    showPortraitPreviews: spec.showPortraitPreviews,
    spec,
  }
}
