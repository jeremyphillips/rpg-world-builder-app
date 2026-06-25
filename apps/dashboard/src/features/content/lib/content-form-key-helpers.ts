import { assignStableContentIds, deriveContentKey } from '@rpg/contracts'

import type { ContentFormInputCtx } from './content-form-registry'

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

/** Slug for Zod create-schema parse; stripped from update payloads by finalizeContentInput. */
export function slugForInputParse(
  name: string,
  ctx?: ContentFormInputCtx<{ slug: string }>,
): string {
  return ctx?.entity?.slug ?? deriveSlugForCreate(name)
}

/** Slug fields for create; omitted on update after first publish. */
export function envelopeSlugFields(
  name: string,
  ctx?: ContentFormInputCtx<{ slug: string }>,
): { slug?: string } {
  if (ctx?.entity) return {}
  return { slug: deriveSlugForCreate(name) }
}

/** Strips slug from parsed input when editing an existing record. */
export function finalizeContentInput<T extends { slug?: string }>(
  input: T,
  ctx?: ContentFormInputCtx<{ slug: string }>,
): T | Omit<T, 'slug'> {
  return ctx?.entity ? stripSlugFromInput(input) : input
}

/**
 * Removes envelope-only keys from edit form defaults. These values are not
 * rendered (slug is derived; kind is route-scoped on family equipment routes)
 * and with `shouldUnregister` they spuriously appear in `dirtyFields` when
 * any registered field updates.
 */
export function stripEditEnvelopeFromFormDefaults<T extends Record<string, unknown>>(
  values: Partial<T>,
  options?: { stripKind?: boolean },
): Partial<T> {
  const next = { ...values }
  delete next.slug
  if (options?.stripKind) {
    delete next.kind
  }
  return next
}
