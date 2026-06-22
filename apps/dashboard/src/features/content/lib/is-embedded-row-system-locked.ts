import type { ContentFormCtx } from './content-form-registry'

/**
 * An embedded master-detail row is delete-locked only when it is system content:
 * an existing row (already has an `id`) on an entity whose `source` is
 * `'system'`. Newly added rows (no id yet) and homebrew entities are always
 * removable. Used when the embedded element has no per-row `source` in the
 * contract (e.g. class features, species traits, heritage blocks/options).
 */
export function isEmbeddedRowSystemLocked(
  row: { id?: string } | undefined,
  entitySource: ContentFormCtx['entitySource'],
): boolean {
  return entitySource === 'system' && typeof row?.id === 'string' && row.id.length > 0
}
