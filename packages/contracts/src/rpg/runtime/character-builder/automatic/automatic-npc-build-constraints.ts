import { z } from 'zod'

// ---------------------------------------------------------------------------
// AutomaticNpcBuildConstraints — hard requirements applied during automatic
// NPC build resolution. Discovery helpers may offer options; the resolver is
// authoritative on satisfiability. Requirement id arrays are unordered sets;
// canonicalize before resolve for deterministic ordering.
// ---------------------------------------------------------------------------

export const automaticNpcBuildConstraintsSchema = z
  .object({
    requiredWeaponIds: z.array(z.string().min(1)),
    requiredSpellIds: z.array(z.string().min(1)),
  })
  .strict()

export type AutomaticNpcBuildConstraints = z.infer<typeof automaticNpcBuildConstraintsSchema>

/** Stable sort + dedupe for unordered requirement sets. */
export function canonicalizeAutomaticNpcBuildConstraints(
  constraints: AutomaticNpcBuildConstraints,
): AutomaticNpcBuildConstraints {
  return {
    requiredWeaponIds: [...new Set(constraints.requiredWeaponIds)].sort(),
    requiredSpellIds: [...new Set(constraints.requiredSpellIds)].sort(),
  }
}

/** Returns undefined when both requirement arrays are empty after canonicalization. */
export function normalizeAutomaticNpcBuildConstraints(
  constraints: AutomaticNpcBuildConstraints | undefined,
): AutomaticNpcBuildConstraints | undefined {
  if (!constraints) return undefined

  const canonical = canonicalizeAutomaticNpcBuildConstraints(constraints)
  if (canonical.requiredWeaponIds.length === 0 && canonical.requiredSpellIds.length === 0) {
    return undefined
  }

  return canonical
}
