import { z } from 'zod'

import { sourceLocatorSchema } from './source-citation'
import { sourceExcerptRefSchema } from './content-provenance'
import { excerptCorrectionReasonSchema, transcriptionCleanupIdSchema } from './transcription'

export const sourceExcerptTranscriptionSchema = z.object({
  method: z.enum(['manual', 'pdf-text']),
  cleanup: z.array(transcriptionCleanupIdSchema),
})

export const sourceExcerptRevisionSchema = sourceExcerptRefSchema.extend({
  revision: z.number().int().min(1),
  locator: sourceLocatorSchema.optional(),
  text: z.string().min(1),
  transcription: sourceExcerptTranscriptionSchema,
  capturedAt: z.iso.date(),
  supersedes: z
    .object({
      revision: z.number().int().min(1),
      reason: excerptCorrectionReasonSchema,
      note: z.string().min(1),
    })
    .optional(),
})

export type SourceExcerptRevision = z.infer<typeof sourceExcerptRevisionSchema>
