import { z } from 'zod'

import { normalizedCropSchema } from './geometry'
import { CONTENT_DISPLAY_IMAGE_SOURCE_KINDS } from './resolve-content-display-image'

export const contentDisplayImageSchema = z.object({
  src: z.string().min(1),
  crop: normalizedCropSchema.optional(),
  sourceKind: z.enum(CONTENT_DISPLAY_IMAGE_SOURCE_KINDS),
  presentationTreatment: z.enum(['white-paper-knockout', 'mono-glyph-invert']).optional(),
})

export type ContentDisplayImageDto = z.infer<typeof contentDisplayImageSchema>
