import { z } from 'zod'

/** Sparse coin grant for starting equipment, level 0 NPC wealth, and similar content. */
export const characterWealthGrantSchema = z
  .object({
    cp: z.number().int().min(0).optional(),
    sp: z.number().int().min(0).optional(),
    gp: z.number().int().min(0).optional(),
    pp: z.number().int().min(0).optional(),
  })
  .strict()

export type CharacterWealthGrant = z.infer<typeof characterWealthGrantSchema>

const WEALTH_GRANT_DENOMINATIONS = [
  'cp',
  'sp',
  'gp',
  'pp',
] as const satisfies readonly (keyof CharacterWealthGrant)[]

/** Returns undefined when no positive coin values remain — sparse grants omit unset denominations. */
export function normalizeCharacterWealthGrant(
  grant: CharacterWealthGrant | undefined,
): CharacterWealthGrant | undefined {
  if (!grant) return undefined

  const result: CharacterWealthGrant = {}
  for (const denomination of WEALTH_GRANT_DENOMINATIONS) {
    const value = grant[denomination]
    if (value !== undefined && value > 0) {
      result[denomination] = value
    }
  }

  return Object.keys(result).length > 0 ? result : undefined
}
