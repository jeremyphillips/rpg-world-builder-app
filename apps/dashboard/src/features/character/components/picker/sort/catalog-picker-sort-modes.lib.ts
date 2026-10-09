/**
 * @deprecated Prefer `@/lib/catalog-sort` mode ids and the axis/preset registry.
 * Re-exports kept for existing picker type aliases.
 */
export {
  CATALOG_SORT_MODE_BEST_MATCH as CATALOG_PICKER_SORT_BEST_MATCH,
  CATALOG_SORT_MODE_NAME_ASC as CATALOG_PICKER_SORT_NAME_ASC,
  CATALOG_SORT_MODE_NAME_DESC as CATALOG_PICKER_SORT_NAME_DESC,
} from '@/lib/catalog-sort'

export const CATALOG_PICKER_SORT_LABEL_BEST_MATCH = 'Best match'
export const CATALOG_PICKER_SORT_LABEL_NAME_ASC = 'Name: A–Z'
export const CATALOG_PICKER_SORT_LABEL_NAME_DESC = 'Name: Z–A'

export const CATALOG_PICKER_SORT_TRIGGER_LABEL_BEST_MATCH = CATALOG_PICKER_SORT_LABEL_BEST_MATCH
export const CATALOG_PICKER_SORT_TRIGGER_LABEL_NAME_ASC = 'A–Z'
export const CATALOG_PICKER_SORT_TRIGGER_LABEL_NAME_DESC = 'Z–A'
