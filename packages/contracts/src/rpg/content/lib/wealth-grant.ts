import { z } from 'zod'

/** Sparse coin grant for starting equipment and similar content — omits unset denominations. */
export const characterWealthGrantSchema = z
  .object({
    cp: z.number().int().min(0).optional(),
    sp: z.number().int().min(0).optional(),
    gp: z.number().int().min(0).optional(),
    pp: z.number().int().min(0).optional(),
  })
  .strict()

export type CharacterWealthGrant = z.infer<typeof characterWealthGrantSchema>
