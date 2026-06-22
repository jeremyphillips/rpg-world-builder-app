import type { ContentFormCtx } from '../../lib/content-form-registry'

/**
 * A species master-detail row is delete-locked only when it is system content:
 * an existing row (already has an `id`) on a species whose `source` is
 * `'system'`. Newly added rows (no id yet) and homebrew species are always
 * removable.
 */
export function isSpeciesRowSystemLocked(
  row: { id?: string } | undefined,
  entitySource: ContentFormCtx['entitySource'],
): boolean {
  return entitySource === 'system' && typeof row?.id === 'string' && row.id.length > 0
}
