import { ActionButton } from '@rpg/ui'

import { catalogToolbarResetSlotReservedClasses } from './catalog-picker-filter-toolbar.variants'

export const CATALOG_TOOLBAR_RESET_VISIBLE_LABEL = 'Reset'

export const CATALOG_TOOLBAR_RESET_WITH_SORT_NAME = 'Reset search, filters, and sorting'

export const CATALOG_TOOLBAR_RESET_WITHOUT_SORT_NAME = 'Reset search and filters'

export function catalogToolbarResetAccessibleName(includesSort: boolean): string {
  return includesSort
    ? CATALOG_TOOLBAR_RESET_WITH_SORT_NAME
    : CATALOG_TOOLBAR_RESET_WITHOUT_SORT_NAME
}

export type CatalogToolbarResetActionProps = {
  label: string
  accessibleName: string
  onClick: () => void
  tabIndex?: number
}

export function CatalogToolbarResetAction({
  label,
  accessibleName,
  onClick,
  tabIndex,
}: CatalogToolbarResetActionProps) {
  return (
    <ActionButton
      action="reset"
      variant="text"
      size="sm"
      density="default"
      iconStep="sm"
      aria-label={accessibleName}
      title={accessibleName}
      onClick={onClick}
      tabIndex={tabIndex}
    >
      {label}
    </ActionButton>
  )
}

export type CatalogToolbarResetSlotProps = {
  visible: boolean
  onClick: () => void
  /** Persistent Sort is on this toolbar. Reserves the reset row while idle. */
  includesSort: boolean
  /**
   * Caller-supplied visible label and accessible name.
   * Equipment clear-filters is the only override; it does not use the reset name.
   */
  label?: string
}

/**
 * Reserves the reset row while idle only when Sort is persistent, so Sort does not jump.
 * Without Sort, an idle slot renders nothing.
 */
export function CatalogToolbarResetSlot({
  visible,
  onClick,
  includesSort,
  label,
}: CatalogToolbarResetSlotProps) {
  if (!visible && !includesSort) return null

  const accessibleName = label ?? catalogToolbarResetAccessibleName(includesSort)
  const visibleLabel = label ?? CATALOG_TOOLBAR_RESET_VISIBLE_LABEL

  return (
    <div
      className={visible ? undefined : catalogToolbarResetSlotReservedClasses}
      aria-hidden={visible ? undefined : true}
    >
      <CatalogToolbarResetAction
        label={visibleLabel}
        accessibleName={accessibleName}
        onClick={onClick}
        tabIndex={visible ? undefined : -1}
      />
    </div>
  )
}
