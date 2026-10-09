/**
 * Catalog sort presentation — Greenfield axis/preset copy and SortMenu section resolution.
 *
 * Does not own comparators, URL sort state, or DataTable column configuration.
 * See catalog-sort.types.ts for the deferred comparator-audit note.
 */

export { CATALOG_SORT_AXES, type CatalogSortAxisKey } from './catalog-sort-axes'
export { CATALOG_SORT_PRESETS, type CatalogSortPresetKey } from './catalog-sort-presets'
export {
  CATALOG_SORT_MODE_BEST_MATCH,
  CATALOG_SORT_MODE_DATE_ASC,
  CATALOG_SORT_MODE_DATE_DESC,
  CATALOG_SORT_MODE_LEVEL_ASC,
  CATALOG_SORT_MODE_LEVEL_DESC,
  CATALOG_SORT_MODE_NAME_ASC,
  CATALOG_SORT_MODE_NAME_DESC,
  CATALOG_SORT_MODE_PRICE_ASC,
  CATALOG_SORT_MODE_PRICE_DESC,
} from './catalog-sort-mode-ids'
export {
  collectCatalogSortValues,
  resolveCatalogSortSections,
  type ResolveCatalogSortSectionsArgs,
} from './resolve-catalog-sort-sections'
export {
  CATALOG_PICKER_SORT_BEST_MATCH,
  CATALOG_PICKER_SORT_LABEL_BEST_MATCH,
  CATALOG_PICKER_SORT_LABEL_NAME_ASC,
  CATALOG_PICKER_SORT_LABEL_NAME_DESC,
  CATALOG_PICKER_SORT_NAME_ASC,
  CATALOG_PICKER_SORT_NAME_DESC,
  CATALOG_PICKER_SORT_TRIGGER_LABEL_BEST_MATCH,
  CATALOG_PICKER_SORT_TRIGGER_LABEL_NAME_ASC,
  CATALOG_PICKER_SORT_TRIGGER_LABEL_NAME_DESC,
} from './catalog-sort-picker-labels'
export type {
  CatalogSortAxisDef,
  CatalogSortAxisId,
  CatalogSortCopy,
  CatalogSortDirection,
  CatalogSortDirectionDef,
  CatalogSortPresetDef,
  CatalogSortPresetId,
} from './catalog-sort.types'
