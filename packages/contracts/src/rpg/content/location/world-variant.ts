import { z } from 'zod'

/** Kind-specific fields for `kind: 'world'`. */
export const worldLocationKindFields = {
  kind: z.literal('world'),
} as const

export const worldLocationKindSchema = z.object(worldLocationKindFields)

export type WorldLocationKindFields = z.infer<typeof worldLocationKindSchema>
