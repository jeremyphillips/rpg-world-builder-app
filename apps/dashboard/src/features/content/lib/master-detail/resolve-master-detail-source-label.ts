import { CATALOG_LAYER_ENTRIES, type CatalogLayer } from '@rpg/contracts'

/** Authoring label for a row that exists only in the open form. */
export const UNSAVED_MASTER_DETAIL_SOURCE_LABEL = 'Unsaved'

export type MasterDetailSourceLabel = CatalogLayer | 'unsaved'

/** Source badge copy shared by embedded rows and nested catalog resources. */
export function resolveMasterDetailSourceLabel(source: MasterDetailSourceLabel): string {
  if (source === 'unsaved') return UNSAVED_MASTER_DETAIL_SOURCE_LABEL
  return CATALOG_LAYER_ENTRIES[source].label
}
