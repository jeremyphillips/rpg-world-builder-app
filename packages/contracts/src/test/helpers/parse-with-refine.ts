import { z } from 'zod'

import { refineLevelRangeTable } from '../../rpg/primitives/level'

export function parseWithRefine(
  rows: { minLevel: number; maxLevel: number }[],
  options?: Parameters<typeof refineLevelRangeTable>[2],
) {
  return z
    .array(z.object({ minLevel: z.number(), maxLevel: z.number() }))
    .superRefine((value, ctx) => refineLevelRangeTable(value, ctx, options))
    .safeParse(rows)
}
