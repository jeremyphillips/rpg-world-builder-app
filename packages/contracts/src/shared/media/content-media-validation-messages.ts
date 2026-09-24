import { defineMessage } from '../../validation/define-message'

export const contentMediaValidationMessages = {
  fixedAspectSourceTooSmall: defineMessage<{
    roleLabel: string
    aspectLabel: string
    minWidthPx: number
    minHeightPx: number
    sourceWidth: number
    sourceHeight: number
    widestCropWidth: number
    widestCropHeight: number
  }>(
    'validation.contentMedia.fixedAspectSourceTooSmall',
    ({
      roleLabel,
      aspectLabel,
      minWidthPx,
      minHeightPx,
      sourceWidth,
      sourceHeight,
      widestCropWidth,
      widestCropHeight,
    }) =>
      `${roleLabel} needs a ${aspectLabel} crop at least ${minWidthPx} × ${minHeightPx} pixels. This image is ${sourceWidth} × ${sourceHeight}, so its widest ${aspectLabel} crop is ${widestCropWidth} × ${widestCropHeight}.`,
  ),
  fixedAspectCropInvalid: defineMessage<{
    roleLabel: string
    aspectLabel: string
    minWidthPx: number
    minHeightPx: number
  }>(
    'validation.contentMedia.fixedAspectCropInvalid',
    ({ roleLabel, aspectLabel, minWidthPx, minHeightPx }) =>
      `${roleLabel} crop must be ${aspectLabel} and at least ${minWidthPx} × ${minHeightPx} pixels.`,
  ),
  emblemSourceTooSmall: defineMessage<{
    minEdgePx: number
    sourceWidth: number
    sourceHeight: number
  }>(
    'validation.contentMedia.emblemSourceTooSmall',
    ({ minEdgePx, sourceWidth, sourceHeight }) =>
      `Emblem needs an image at least ${minEdgePx} × ${minEdgePx} pixels. This image is ${sourceWidth} × ${sourceHeight}.`,
  ),
}
