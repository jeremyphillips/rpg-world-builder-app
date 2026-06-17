import { z } from 'zod'

// ---------------------------------------------------------------------------
// Die faces — the standard polyhedral set. Shared primitive for any dice
// notation (hit dice, damage, monster hit dice, ...).
// ---------------------------------------------------------------------------

export const DIE_FACES = [4, 6, 8, 10, 12, 20, 100] as const

export type DieFace = (typeof DIE_FACES)[number]

export const dieFaceSchema = z.union(
  DIE_FACES.map((f) => z.literal(f)) as [z.ZodLiteral<DieFace>, ...z.ZodLiteral<DieFace>[]],
)

// ---------------------------------------------------------------------------
// Hit die — a die face restricted to the range classes use (d6–d12). Monsters
// reuse `dieFaceSchema` directly.
// ---------------------------------------------------------------------------

export const CLASS_HIT_DICE = [6, 8, 10, 12] as const satisfies readonly DieFace[]

export type ClassHitDie = (typeof CLASS_HIT_DICE)[number]

export const hitDieSchema = z.union(
  CLASS_HIT_DICE.map((f) => z.literal(f)) as [
    z.ZodLiteral<ClassHitDie>,
    ...z.ZodLiteral<ClassHitDie>[],
  ],
)
