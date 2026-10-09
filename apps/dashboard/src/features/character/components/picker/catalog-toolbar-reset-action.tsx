import { ActionButton } from '@rpg/ui'
import { FilterToolbarLabelSizer } from '@rpg/ui/filters'

import { ResultSummary } from '@/lib/data-table/overview-result-summary'

import {
  catalogPickerResultSummaryClasses,
  catalogToolbarResetRowClasses,
  catalogToolbarResetSlotReservedClasses,
} from './catalog-picker-filter-toolbar.variants'
import {
  CATALOG_TOOLBAR_RESET_VISIBLE_LABEL,
  catalogToolbarResetAccessibleName,
} from './catalog-toolbar-reset-action.lib'

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
  /** Visible count for the current list. Omit when this slot has no summary. */
  summaryVisibleCount?: number
  /** Every `formatResultCount` label from 0 through the eligible total. */
  summaryReserveLabels?: readonly string[]
}

function CatalogToolbarResultCount({
  visibleCount,
  reserveLabels,
}: {
  visibleCount: number
  reserveLabels: readonly string[]
}) {
  return (
    <span className={catalogPickerResultSummaryClasses}>
      <FilterToolbarLabelSizer labels={reserveLabels}>
        <ResultSummary visibleCount={visibleCount} />
      </FilterToolbarLabelSizer>
    </span>
  )
}

function CatalogToolbarResetControl({
  visible,
  label,
  accessibleName,
  onClick,
}: {
  visible: boolean
  label: string
  accessibleName: string
  onClick: () => void
}) {
  return (
    <div
      className={visible ? undefined : catalogToolbarResetSlotReservedClasses}
      aria-hidden={visible ? undefined : true}
    >
      <CatalogToolbarResetAction
        label={label}
        accessibleName={accessibleName}
        onClick={onClick}
        tabIndex={visible ? undefined : -1}
      />
    </div>
  )
}

function shouldMountCatalogToolbarResetSlot(args: {
  showSummary: boolean
  visible: boolean
  shouldReserve: boolean
}): boolean {
  return args.showSummary || args.visible || args.shouldReserve
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
  summaryVisibleCount,
  summaryReserveLabels,
}: CatalogToolbarResetSlotProps) {
  const shouldReserve = reserve ?? includesSort
  const showSummary = summaryVisibleCount !== undefined
  if (!shouldMountCatalogToolbarResetSlot({ showSummary, visible, shouldReserve })) return null

  return (
    <div className={catalogToolbarResetRowClasses}>
      {showSummary ? (
        <CatalogToolbarResultCount
          visibleCount={summaryVisibleCount}
          reserveLabels={summaryReserveLabels ?? []}
        />
      ) : null}
      {visible || shouldReserve ? (
        <CatalogToolbarResetControl
          visible={visible}
          label={label ?? CATALOG_TOOLBAR_RESET_VISIBLE_LABEL}
          accessibleName={label ?? catalogToolbarResetAccessibleName(includesSort)}
          onClick={onClick}
        />
      ) : null}
    </div>
  )
}
