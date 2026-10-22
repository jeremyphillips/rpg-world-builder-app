import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { iconGlyphDescendantClasses } from './icon-glyph.variants'
import { establishSurfaceCurrent, portalPopoverSurfaceClasses } from './surface-current.lib'

/** Outer wrapper for the entire DataTable — stacks toolbar, table, and pagination. */
export const dataTableRootVariants = cva('flex flex-col gap-3 w-full')

/** Toolbar row — primary filter strip + column toggle. */
export const dataTableToolbarVariants = cva('flex flex-wrap items-center gap-2')

/** Neutral slot wrapper above table headers — chrome owned by injected content (e.g. DataTableUtilityBar). */
export const dataTableUtilityStripVariants = cva('w-full')

/** Container for the group of inline filter controls on the left of the toolbar. */
export const dataTableFilterGroupVariants = cva('flex flex-1 flex-wrap items-center gap-2')

/** A single filter control wrapper (constrains width). */
export const dataTableFilterControlVariants = cva('', {
  variants: {
    type: {
      text: 'min-w-[180px] max-w-[260px] flex-1',
      select: 'min-w-[140px] max-w-[200px]',
      boolean: 'flex items-center gap-1.5',
    },
  },
})

/** Collapsible advanced-filters panel border + padding. */
export const dataTableAdvancedPanelVariants = cva(
  cn(
    'overflow-hidden rounded-md border border-border bg-surface-muted',
    establishSurfaceCurrent('surface-muted'),
  ),
)

/** Inner grid for secondary filter controls. */
export const dataTableAdvancedInnerVariants = cva('grid gap-3 p-4', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    },
  },
  defaultVariants: { cols: 3 },
})

/** Pagination row — spaced between count label and page controls. */
export const dataTablePaginationVariants = cva(
  'flex flex-wrap items-center justify-between gap-2 text-style-supporting',
)

/** Table container — elevated card plane on the page canvas. */
export const dataTableTableWrapVariants = cva(
  'ui-data-table__table-wrap overflow-hidden rounded-card border border-border text-foreground shadow-surface-raised',
)

/**
 * Table element — natural column widths at all breakpoints; the Table wrapper
 * scrolls horizontally when columns exceed the card width.
 */
export const dataTableTableVariants = cva('w-full min-w-max text-table-body')

/** Catalog thumbnail sizing — 24px default, 32px at lg+. Pair with `dataTableWidthMeta('image')`. */
export const dataTableImageVariants = cva('size-6 shrink-0 rounded-md object-cover lg:size-8')

/** Toolbar notice row below primary filters — hidden counts, filter actions. */
export const dataTableFilterNoticeVariants = cva(
  'flex flex-wrap items-center gap-x-2 gap-y-1 text-style-caption',
)

/** Body cell text roles — metadata, stats, and other opt-in typography. */
export const dataTableCellTextVariants = cva('', {
  variants: {
    role: {
      /** Secondary metadata — 11px / light. */
      meta: 'text-badge-sm font-meta',
      /** Supplementary metadata — 11px / light / italic. */
      metaItalic: 'text-badge-sm font-meta italic',
      /** Abbreviated stats (STR, CON, AC) — 12px / medium. */
      stat: 'text-table-stat font-data-stat text-foreground',
    },
  },
})

/** Primary name/label cell typography inside identity columns. */
export const dataTableNameCellVariants = cva('font-data-name')

/** Name cell when rendered as a navigable link. */
export const dataTableNameLinkCellVariants = cva(
  'font-data-name hover:underline focus-visible:underline',
)

/** Popover panel for the column visibility / order editor. */
export const dataTableColumnPanelVariants = cva(
  cn(
    'z-50 w-[240px] overflow-hidden rounded-md border border-border bg-popover p-0 shadow-md',
    portalPopoverSurfaceClasses,
  ),
)

/** A single row inside the column panel list. */
export const dataTableColumnItemVariants = cva(
  'flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground',
)

/** The drag handle button inside a column panel row. */
export const dataTableColumnDragHandleVariants = cva(
  'flex cursor-grab items-center rounded p-0.5 text-muted-foreground hover:text-foreground active:cursor-grabbing',
)

/** Empty column panel search result. */
export const dataTableEmptyPanelVariants = cva('px-3 py-2 text-style-supporting')

/** Locked (always-visible) column row in the panel. */
export const dataTableLockedColumnVariants = cva(
  'flex cursor-default items-center gap-2 px-2 py-1.5 text-style-supporting',
)

/** Reset column order control in the panel footer. */
export const dataTableResetColumnVariants = cva(
  'flex w-full items-center gap-2 rounded px-2 py-1.5 text-style-supporting hover:bg-accent hover:text-accent-foreground',
)

/** Active filter chip dismiss control in the toolbar. */
export const dataTableFilterChipVariants = cva(
  'inline-flex items-center gap-1 text-style-caption hover:text-foreground',
)

/** Accessible caption below the table — supplementary source / scope note. */
export const dataTableCaptionVariants = cva('pb-3 text-sm-meta italic text-muted-foreground')

/** Row action dropdown menu item — compact text + sm glyph. */
export function dataTableRowActionItemClasses(destructive?: boolean): string {
  return cn(
    'text-xs',
    iconGlyphDescendantClasses.sm,
    destructive && 'text-destructive focus:text-destructive',
  )
}
