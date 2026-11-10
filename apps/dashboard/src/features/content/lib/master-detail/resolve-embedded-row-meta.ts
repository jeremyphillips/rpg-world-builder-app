import type { CatalogLayer } from '@rpg/contracts'

import { resolveAvailability, type Availability, type AvailabilityReason } from '@/lib/availability'
import type { ContentFormCtx } from '../forms/registry/content-form-registry'
import type { MasterDetailPersistence, MasterDetailProvenance } from './master-detail-item-meta'

export type EmbeddedRowSource = MasterDetailProvenance

export interface ResolveEmbeddedRowMetaParams {
  row: { id?: string } | undefined
  entityCatalogLayer: ContentFormCtx['entityCatalogLayer']
  /** Ids on the latest saved entity. Absent on create. */
  persistedRowIds?: ReadonlySet<string>
  /** Ids frozen from the first load of a system entity. */
  systemOriginRowIds?: ReadonlySet<string>
  extraReasons?: readonly AvailabilityReason[]
}

export interface EmbeddedRowMeta {
  provenance: MasterDetailProvenance
  persistence: MasterDetailPersistence
  deletable: boolean
  availability: Availability
}

function rowId(row: { id?: string } | undefined): string | undefined {
  return typeof row?.id === 'string' && row.id.length > 0 ? row.id : undefined
}

/** System only when this id was on the system entity at editor open. */
export function resolveEmbeddedRowProvenance(
  row: { id?: string } | undefined,
  entityCatalogLayer: CatalogLayer | undefined,
  systemOriginRowIds?: ReadonlySet<string>,
): MasterDetailProvenance {
  const id = rowId(row)
  if (entityCatalogLayer !== 'system' || !id || !systemOriginRowIds?.has(id)) return 'homebrew'
  return 'system'
}

/** Persisted only when this id is on the latest saved entity. */
export function resolveEmbeddedRowPersistence(
  row: { id?: string } | undefined,
  persistedRowIds?: ReadonlySet<string>,
): MasterDetailPersistence {
  const id = rowId(row)
  if (!id || !persistedRowIds?.has(id)) return 'new'
  return 'persisted'
}

export function resolveEmbeddedRowMeta({
  row,
  entityCatalogLayer,
  persistedRowIds,
  systemOriginRowIds,
  extraReasons = [],
}: ResolveEmbeddedRowMetaParams): EmbeddedRowMeta {
  const provenance = resolveEmbeddedRowProvenance(row, entityCatalogLayer, systemOriginRowIds)
  const persistence = resolveEmbeddedRowPersistence(row, persistedRowIds)
  const availability = resolveAvailability(extraReasons)

  return {
    provenance,
    persistence,
    deletable: provenance !== 'system',
    availability,
  }
}
