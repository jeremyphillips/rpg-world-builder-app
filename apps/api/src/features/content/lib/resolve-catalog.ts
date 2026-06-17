import { deepMerge } from './deep-merge'

/** Any stored content record is referenced by its opaque `id`. */
interface Identified {
  id: string
}

/** A per-campaign overlay patch: a partial body keyed by the base record id. */
export interface OverlayPatch {
  targetId: string
  patch: Record<string, unknown>
}

/**
 * Resolve a campaign's effective catalog for one content type (type-agnostic):
 *
 * 1. deep-merge each overlay patch onto its base system record (by `targetId`),
 * 2. append the campaign's homebrew records.
 *
 * Patches whose `targetId` matches no system record are ignored (the base was
 * removed in a newer ruleset). The system seed is never mutated.
 */
export function resolveCatalog<T extends Identified>(
  system: readonly T[],
  patches: readonly OverlayPatch[],
  homebrew: readonly T[],
): T[] {
  const patchByTarget = new Map(patches.map((p) => [p.targetId, p]))

  const resolvedSystem = system.map((record) => {
    const overlay = patchByTarget.get(record.id)
    return overlay ? deepMerge(record, overlay.patch) : record
  })

  return [...resolvedSystem, ...homebrew]
}
