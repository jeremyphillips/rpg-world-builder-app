import { CATALOG_SORT_AXES } from './catalog-sort-axes'
import { CATALOG_SORT_PRESETS } from './catalog-sort-presets'

/** Stable mode ids from the presentation registry — features may re-export aliases. */
export const CATALOG_SORT_MODE_BEST_MATCH = CATALOG_SORT_PRESETS.best_match.value
export const CATALOG_SORT_MODE_NAME_ASC = CATALOG_SORT_AXES.name.ascending.value
export const CATALOG_SORT_MODE_NAME_DESC = CATALOG_SORT_AXES.name.descending.value
export const CATALOG_SORT_MODE_PRICE_ASC = CATALOG_SORT_AXES.price.ascending.value
export const CATALOG_SORT_MODE_PRICE_DESC = CATALOG_SORT_AXES.price.descending.value
export const CATALOG_SORT_MODE_DATE_ASC = CATALOG_SORT_AXES.createdAt.ascending.value
export const CATALOG_SORT_MODE_DATE_DESC = CATALOG_SORT_AXES.createdAt.descending.value
export const CATALOG_SORT_MODE_LEVEL_ASC = CATALOG_SORT_AXES.level.ascending.value
export const CATALOG_SORT_MODE_LEVEL_DESC = CATALOG_SORT_AXES.level.descending.value
