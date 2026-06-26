import type { ContentFormCtx } from './content-form-registry'
import { resolveEmbeddedRowSource } from './resolve-embedded-row-meta'

/**
 * An embedded master-detail row is delete-locked only when it is system content:
 * a seed row on an entity whose `source` is `'system'`. Newly added rows and
 * homebrew entities are always removable. Used when the embedded element has no
 * per-row `source` in the contract (e.g. class features, species traits).
 */
export function isEmbeddedRowSystemLocked(
  row: { id?: string } | undefined,
  entitySource: ContentFormCtx['entitySource'],
  seedRowIds?: ReadonlySet<string>,
): boolean {
  return resolveEmbeddedRowSource(row, entitySource, seedRowIds) === 'system'
}
