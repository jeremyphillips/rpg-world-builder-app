import { z } from 'zod'

import { systemOverlayIntentSchema } from './intent'

export const SYSTEM_OVERLAY_INTENT_FIELD = 'systemOverlayIntent' as const
export const EXPECTED_OVERLAY_REVISION_FIELD = 'expectedOverlayRevision' as const

export const systemOverlayUpdateEnvelopeSchema = z
  .object({
    [SYSTEM_OVERLAY_INTENT_FIELD]: systemOverlayIntentSchema,
    [EXPECTED_OVERLAY_REVISION_FIELD]: z.number().int().min(0),
  })
  .strict()

export type SystemOverlayUpdateEnvelope = z.infer<typeof systemOverlayUpdateEnvelopeSchema>

export function mergeSystemOverlayUpdateEnvelope<T extends z.ZodTypeAny>(schema: T) {
  return schema.and(
    z
      .object({
        [SYSTEM_OVERLAY_INTENT_FIELD]: systemOverlayIntentSchema.optional(),
        [EXPECTED_OVERLAY_REVISION_FIELD]: z.number().int().min(0).optional(),
      })
      .partial(),
  )
}
