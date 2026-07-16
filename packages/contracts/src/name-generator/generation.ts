import { z } from 'zod'

// ---------------------------------------------------------------------------
// Generation requests, results, and limits.
// ---------------------------------------------------------------------------

export const NAME_GENDER_STYLES = [
  'masculine',
  'feminine',
  'neutral',
  'shared',
  'not-applicable',
] as const

export const nameGenderStyleSchema = z.enum(NAME_GENDER_STYLES)

export type NameGenderStyle = z.infer<typeof nameGenderStyleSchema>

export const MAX_GENERATE_COUNT = 50
export const MAX_NAME_LENGTH = 64
export const MAX_DUPLICATE_ATTEMPTS = 10

export const SUPPORTED_NAME_COLLECTION_VERSION = 1

export const generateNamesRequestSchema = z.object({
  conventionId: z.string().min(1),
  structureId: z.string().min(1).optional(),
  count: z.number().int().min(1).max(MAX_GENERATE_COUNT),
  seed: z.string().min(1).optional(),
  genderStyle: nameGenderStyleSchema.optional(),
  exclude: z.array(z.string().min(1)).optional(),
})

export type GenerateNamesRequest = z.infer<typeof generateNamesRequestSchema>

export const generatedNameSchema = z.object({
  value: z.string().min(1),
  conventionId: z.string().min(1),
  structureId: z.string().min(1),
  parts: z.record(z.string(), z.string()),
  seed: z.string().min(1).optional(),
})

export type GeneratedName = z.infer<typeof generatedNameSchema>
