import { assignStableContentIds, deriveContentKey } from '@rpg/contracts'

/** Derives a catalog envelope slug on create from the display name. */
export function deriveSlugForCreate(name: string): string {
  return deriveContentKey(name)
}

/**
 * Assigns or preserves nested trait/feature ids on update.
 * See `assignStableContentIds` in `@rpg/contracts`.
 */
export function applyStableIdsForUpdate<T extends { id?: string; name: string }>(
  rows: readonly T[],
  existing?: ReadonlyArray<{ id: string }>,
): Array<T & { id: string }> {
  return assignStableContentIds(rows, existing)
}

/** Removes envelope slug from an update payload (immutable after create). */
export function stripSlugFromInput<T extends { slug?: string }>(input: T): Omit<T, 'slug'> {
  const { slug: _slug, ...rest } = input
  return rest
}
