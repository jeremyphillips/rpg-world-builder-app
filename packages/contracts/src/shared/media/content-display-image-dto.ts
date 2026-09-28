import { z } from 'zod'

import { normalizedCropSchema, normalizedFocalPointSchema } from './geometry'
import { mediaRoleSchema } from './roles'
import { CONTENT_DISPLAY_IMAGE_SOURCE_KINDS } from './resolve-content-display-image'

export const contentDisplayImageSchema = z.object({
  src: z.string().min(1),
  role: mediaRoleSchema,
  crop: normalizedCropSchema.optional(),
  focalPoint: normalizedFocalPointSchema.optional(),
  sourceKind: z.enum(CONTENT_DISPLAY_IMAGE_SOURCE_KINDS),
  presentationTreatment: z.enum(['white-paper-knockout', 'mono-glyph-invert']).optional(),
})

export type ContentDisplayImageDto = z.infer<typeof contentDisplayImageSchema>

const contentDisplayImagesByRoleShape = {
  portrait: contentDisplayImageSchema.optional(),
  primary: contentDisplayImageSchema.optional(),
  banner: contentDisplayImageSchema.optional(),
  emblem: contentDisplayImageSchema.optional(),
} as const

export const contentDisplayImagesByRoleSchema = z
  .object(contentDisplayImagesByRoleShape)
  .strict()
  .partial()

export type ContentDisplayImagesByRole = z.infer<typeof contentDisplayImagesByRoleSchema>
