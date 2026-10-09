export const CATALOG_TOOLBAR_RESET_VISIBLE_LABEL = 'Reset'

export const CATALOG_TOOLBAR_RESET_WITH_SORT_NAME = 'Reset search, filters, and sorting'

export const CATALOG_TOOLBAR_RESET_WITHOUT_SORT_NAME = 'Reset search and filters'

export function catalogToolbarResetAccessibleName(includesSort: boolean): string {
  return includesSort
    ? CATALOG_TOOLBAR_RESET_WITH_SORT_NAME
    : CATALOG_TOOLBAR_RESET_WITHOUT_SORT_NAME
}
