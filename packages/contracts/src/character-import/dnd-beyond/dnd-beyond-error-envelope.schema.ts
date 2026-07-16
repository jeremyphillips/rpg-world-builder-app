import { z } from 'zod'

// ---------------------------------------------------------------------------
// D&D Beyond upstream error envelope — parsed before success/schema validation.
// ---------------------------------------------------------------------------

export const dndBeyondUpstreamErrorSchema = z
  .object({
    code: z.string(),
    message: z.string().nullable().optional(),
    innerError: z.unknown().nullable().optional(),
  })
  .passthrough()

export const dndBeyondErrorEnvelopeSchema = z
  .object({
    error: dndBeyondUpstreamErrorSchema,
  })
  .passthrough()

export type DndBeyondErrorEnvelope = z.infer<typeof dndBeyondErrorEnvelopeSchema>

export const DND_BEYOND_UNSUPPORTED_API_VERSION_CODE = 'UnsupportedApiVersion' as const
