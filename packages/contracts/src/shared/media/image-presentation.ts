import { z } from 'zod'

import { normalizedCropSchema, normalizedFocalPointSchema } from './geometry'
import { CONTENT_MEDIA_EMBLEM_PADDING_MAX, CONTENT_MEDIA_EMBLEM_SCALE_MIN } from './limits'

const emblemOffsetSchema = z
  .object({
    x: z.number(),
    y: z.number(),
  })
  .strict()

export const cropPresentationSchema = z
  .object({
    mode: z.literal('crop'),
    crop: normalizedCropSchema.optional(),
    focalPoint: normalizedFocalPointSchema.optional(),
  })
  .strict()

export type CropPresentation = z.infer<typeof cropPresentationSchema>

export const containPresentationSchema = z
  .object({
    mode: z.literal('contain'),
    scale: z.number().min(CONTENT_MEDIA_EMBLEM_SCALE_MIN).max(1),
    padding: z.number().min(0).max(CONTENT_MEDIA_EMBLEM_PADDING_MAX),
    offset: emblemOffsetSchema.optional(),
  })
  .strict()

export type ContainPresentation = z.infer<typeof containPresentationSchema>

/** Per-role presentation metadata. Crop roles use `mode: 'crop'`; emblem uses `mode: 'contain'`. */
export const imagePresentationSchema = z.discriminatedUnion('mode', [
  cropPresentationSchema,
  containPresentationSchema,
])

export type ImagePresentation = z.infer<typeof imagePresentationSchema>

export function isCropPresentation(
  presentation: ImagePresentation | undefined,
): presentation is CropPresentation {
  return presentation?.mode === 'crop'
}

export function isContainPresentation(
  presentation: ImagePresentation | undefined,
): presentation is ContainPresentation {
  return presentation?.mode === 'contain'
}
