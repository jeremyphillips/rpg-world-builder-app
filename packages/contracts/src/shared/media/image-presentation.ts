import { z } from 'zod'

import { normalizedCropSchema, normalizedFocalPointSchema } from './geometry'

/** Per-role or per-attachment presentation metadata. */
export const imagePresentationSchema = z
  .object({
    crop: normalizedCropSchema.optional(),
    focalPoint: normalizedFocalPointSchema.optional(),
  })
  .strict()

export type ImagePresentation = z.infer<typeof imagePresentationSchema>
