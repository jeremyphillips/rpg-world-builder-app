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

export const WEALTH_GRANT_DENOMINATIONS = [
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

/**
 * Normalizes a campaign wealth tier grant. Explicit zero is kept as `{ gp: 0 }`
 * so Mongo minimize and sparse patch semantics treat the tier as authoritative.
 */
export function normalizeWealthTierGrant(
  grant: CharacterWealthGrant | undefined,
): CharacterWealthGrant {
  if (!grant) return { gp: 0 }

  const positive = normalizeCharacterWealthGrant(grant)
  if (positive) return positive

  for (const denomination of WEALTH_GRANT_DENOMINATIONS) {
    if (grant[denomination] === 0) {
      return { [denomination]: 0 }
    }
  }

  return { gp: 0 }
}

export function characterWealthGrantsEqual(
  left: CharacterWealthGrant | undefined,
  right: CharacterWealthGrant | undefined,
): boolean {
  return WEALTH_GRANT_DENOMINATIONS.every(
    (denomination) => (left?.[denomination] ?? undefined) === (right?.[denomination] ?? undefined),
  )
}
