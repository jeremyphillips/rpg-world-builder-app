import { z } from 'zod'

// ---------------------------------------------------------------------------
// AutomaticNpcBuildConstraints — hard requirements applied during automatic
// NPC build resolution. Discovery helpers may offer options; the resolver is
// authoritative on satisfiability.
// ---------------------------------------------------------------------------

export const automaticNpcBuildConstraintsSchema = z
  .object({
    requiredWeaponId: z.string().min(1).optional(),
    requiredSpellId: z.string().min(1).optional(),
  })
  .strict()

export type AutomaticNpcBuildConstraints = z.infer<typeof automaticNpcBuildConstraintsSchema>
