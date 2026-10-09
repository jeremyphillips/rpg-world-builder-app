/**
 * Catalog sort **presentation** vocabulary.
 *
 * Axis names are Greenfield semantics (e.g. `price`), not storage field names
 * (`cost`) or DataTable column ids. Mode string values on each direction keep
 * existing picker wire forms (`name_asc`, `date_desc`, …).
 *
 * TODO(catalog-sort): Future follow-up — audit comparison kernels (name, copper,
 * createdAt, level, unknown-value policy) independently of this presentation
 * registry. Do not fold sorting-engine work into UI ownership cleanup.
 */

export type CatalogSortDirection = 'ascending' | 'descending'

export type CatalogSortAxisId = 'name' | 'price' | 'createdAt' | 'level'

/** Named ordering strategies (relevance, recommendation, …) — not axis/direction pairs. */
export type CatalogSortPresetId = 'best_match'

export type CatalogSortCopy = {
  /** Menu row copy. */
  label: string
  /** Compact trigger copy. */
  triggerLabel: string
}

export type CatalogSortDirectionDef = CatalogSortCopy & {
  /** Stable mode id consumed by pickers today (`name_asc`, `price_desc`, …). */
  value: string
}

export type CatalogSortAxisDef = {
  /** Group heading in SortMenu. */
  label: string
  ascending: CatalogSortDirectionDef
  descending: CatalogSortDirectionDef
  /**
   * Order of direction rows under the group heading.
   * Default: ascending then descending. Date created prefers newest-first.
   */
  directionOrder?: readonly CatalogSortDirection[]
}

export type CatalogSortPresetDef = CatalogSortCopy & {
  value: string
}
