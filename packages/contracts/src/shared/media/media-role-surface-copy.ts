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
}

function fixedAspectInstructions(spec: FixedAspectCropSpec, repositionOnly = false): string {
  const aspectLabel = formatAspectRatioLabel(spec)
  if (repositionOnly) {
    return `Drag to reposition, or focus the crop and use arrow keys. Portrait is fixed at ${aspectLabel}.`
  }
  if (spec.supportsFocalPoint) {
    return `Drag to reposition the ${aspectLabel} crop and place the focal point inside it.`
  }
  return `Drag to reposition the ${aspectLabel} crop.`
}

const portraitSpec = getFixedAspectCropSpec('portrait')!
const bannerSpec = getFixedAspectCropSpec('banner')!
const primarySpec = getFixedAspectCropSpec('primary')!

export const mediaRoleSurfaceCopy = {
  portrait: {
    positionLabel: 'Portrait crop position',
    instructions: fixedAspectInstructions(portraitSpec, true),
    workspaceHeading: 'Portrait crop',
    workspaceDescription:
      'Crop and position how this image appears in character cards, lists, and tokens.',
  },
  banner: {
    positionLabel: 'Banner crop position',
    instructions: fixedAspectInstructions(bannerSpec),
    workspaceHeading: 'Banner crop',
    workspaceDescription: `Crop a ${formatAspectRatioLabel(bannerSpec)} banner and place the focal point inside that crop.`,
  },
  primary: {
    positionLabel: 'Primary crop position',
    instructions: fixedAspectInstructions(primarySpec),
    workspaceHeading: 'Primary crop',
    workspaceDescription: `Crop a ${formatAspectRatioLabel(primarySpec)} detail image and place the focal point inside that crop. The original file is kept.`,
  },
  emblem: {
    positionLabel: 'Emblem layout',
    instructions: 'Drag to reposition the emblem within the frame.',
    workspaceHeading: 'Edit emblem',
    workspaceDescription: "Adjust how the emblem appears inside the frame. It won't be cropped.",
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
