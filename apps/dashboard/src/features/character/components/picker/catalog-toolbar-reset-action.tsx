import { ActionButton } from '@rpg/ui'
import { FilterToolbarLabelSizer } from '@rpg/ui/filters'

import {
  catalogPickerResultSummaryClasses,
  catalogToolbarResetRowClasses,
  catalogToolbarResetSlotReservedClasses,
} from './catalog-picker-filter-toolbar.variants'

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

/**
 * Drawer reset chrome. Variant, size, density, and the reset glyph are fixed
 * here so callers cannot restyle the control.
 */
const CATALOG_TOOLBAR_RESET_CHROME = {
  action: 'reset',
  variant: 'text',
  size: 'sm',
  density: 'compact',
} as const

export function CatalogToolbarResetAction({
  label,
  accessibleName,
  onClick,
  tabIndex,
}: CatalogToolbarResetActionProps) {
  return (
    <ActionButton
      action={CATALOG_TOOLBAR_RESET_CHROME.action}
      variant={CATALOG_TOOLBAR_RESET_CHROME.variant}
      size={CATALOG_TOOLBAR_RESET_CHROME.size}
      density={CATALOG_TOOLBAR_RESET_CHROME.density}
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
  /** Sort is on this toolbar. Chooses the default accessible name and reserves the row. */
  includesSort: boolean
  /**
   * Keep the reset row mounted while idle. Defaults to `includesSort`.
   * Set when a utility band renders without Sort, so that band does not jump.
   */
  reserve?: boolean
  /**
   * Replaces the visible label and the accessible name. Defaults to `Reset`
   * with the sort-aware accessible name.
   */
  label?: string
  /** Visible count, for example `12 of 87`. Omit when nothing narrows the list. */
  summary?: string
  /** Widest summary label, usually `total of total`, so the count does not change width. */
  summaryReserveLabel?: string
}

/**
 * Reserves the reset row while idle whenever a utility band renders, so Sort
 * and content filters do not jump when Reset appears.
 */
export function CatalogToolbarResetSlot({
  visible,
  onClick,
  includesSort,
  reserve,
  label,
  summary,
  summaryReserveLabel,
}: CatalogToolbarResetSlotProps) {
  const shouldReserve = reserve ?? includesSort
  if (!visible && !shouldReserve) return null

  const accessibleName = label ?? catalogToolbarResetAccessibleName(includesSort)
  const visibleLabel = label ?? CATALOG_TOOLBAR_RESET_VISIBLE_LABEL

  return (
    <div className={catalogToolbarResetRowClasses}>
      {summary ? (
        <span aria-live="polite" className={catalogPickerResultSummaryClasses}>
          <FilterToolbarLabelSizer labels={[summaryReserveLabel ?? summary]}>
            {summary}
          </FilterToolbarLabelSizer>
        </span>
      ) : null}
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
    </div>
  )
}
