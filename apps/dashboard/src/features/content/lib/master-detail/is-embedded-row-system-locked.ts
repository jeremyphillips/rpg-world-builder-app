import type { ContentFormCtx } from '../forms/registry/content-form-registry'
import { resolveEmbeddedRowProvenance } from './resolve-embedded-row-meta'

/**
 * An embedded master-detail row is delete-locked only when it was on the
 * system entity at editor open. Newly added rows and homebrew entities are
 * always removable.
 */
export function isEmbeddedRowSystemLocked(
  row: { id?: string } | undefined,
  entityCatalogLayer: ContentFormCtx['entityCatalogLayer'],
  systemOriginRowIds?: ReadonlySet<string>,
): boolean {
  return resolveEmbeddedRowProvenance(row, entityCatalogLayer, systemOriginRowIds) === 'system'
}
