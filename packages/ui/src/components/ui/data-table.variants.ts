import { cva } from 'class-variance-authority'

/** Outer wrapper for the entire DataTable — stacks toolbar, table, and pagination. */
export const dataTableRootVariants = cva('flex flex-col gap-3 w-full')

/** Toolbar row — primary filter strip + column toggle. */
export const dataTableToolbarVariants = cva('flex flex-wrap items-center gap-2')

/** Tinted utility strip rendered above table headers when `utilityStrip` is provided. */
export const dataTableUtilityStripVariants = cva(
  'flex min-h-10 items-center border-b border-border bg-sunken px-3',
)

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
  'overflow-hidden rounded-md border border-border bg-surface-muted',
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
  'flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground',
)

/** Table container — elevated card plane on the page canvas. */
export const dataTableTableWrapVariants = cva(
  'overflow-hidden rounded-card border border-border bg-surface-muted text-foreground shadow-surface-raised',
)

/**
 * Table element — below `lg`, keep natural column widths and scroll horizontally
 * instead of crushing fixed-width columns (e.g. thumbnails). At `lg+`, allow the
 * table to shrink to the container when there is enough room.
 */
export const dataTableTableVariants = cva(
  'w-full min-w-max text-table-body lg:min-w-0 lg:table-fixed',
)

/** Header row — recessed band; hover matches fill so sort controls stay stable. */
export const dataTableHeaderRowVariants = cva(
  'border-b border-border bg-surface-strong hover:bg-surface-strong data-[state=selected]:bg-surface-strong',
)

/** Body row — uniform fill with row-level hover and selection. */
export const dataTableRowVariants = cva(
  'group/row min-h-14 border-b border-border-subtle hover:bg-row-hover data-[state=selected]:bg-row-selected',
)

/** Catalog thumbnail sizing — 24px default, 32px at lg+. Pair with `dataTableWidthMeta('image')`. */
export const dataTableImageVariants = cva('size-6 shrink-0 rounded-md object-cover lg:size-8')

/** Unavailable / inactive row — faint warning wash (table-safe — no pseudo-elements on `<tr>`). */
export const dataTableRowUnavailableVariants = cva('bg-warning-faint')

/**
 * Leading-cell accent rail for unavailable rows — inset shadow is table-safe unlike `::before` on `<tr>`.
 * Apply to the first visible cell in an unavailable row.
 */
export const dataTableRowUnavailableRailVariants = cva(
  'shadow-[inset_2px_0_0_var(--color-semantic-warning-accent-faint)]',
)

/** Toolbar notice row below primary filters — hidden counts, filter actions. */
export const dataTableFilterNoticeVariants = cva(
  'flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground',
)

/** Header cell — group context for sort icon hover/focus affordance. */
export const dataTableHeaderCellVariants = cva(
  'group/header h-10 bg-transparent text-xs font-semibold tracking-wide text-muted-foreground',
)

/** Sticky trailing actions header — stays visible during horizontal scroll. */
export const dataTableActionsHeaderVariants = cva(
  'sticky right-0 z-20 w-12 max-w-12 shrink-0 border-l border-border bg-surface-strong px-1 text-center',
)

/** Sticky trailing actions body cell — matches row hover, selection, and unavailable tones. */
export const dataTableActionsCellVariants = cva(
  'sticky right-0 z-10 w-12 max-w-12 shrink-0 border-l border-border bg-surface-muted px-1 text-center group-hover/row:bg-row-hover group-data-[state=selected]/row:bg-row-selected group-[.bg-warning-faint]/row:bg-warning-faint',
)

/** Tighter body cell padding than the base TableCell default. */
export const dataTableBodyCellPaddingVariants = cva('px-3 py-2')

/** Body cell tone — typography only; row supplies uniform background. */
export const dataTableBodyCellVariants = cva('transition-colors', {
  variants: {
    tone: {
      identity: '',
      data: 'text-muted-foreground',
      source: 'text-muted-foreground',
      actions: '',
      neutral: '',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

/** Sort icon visibility and size inside SortableHeader. */
export const dataTableSortIconVariants = cva('ml-1 size-3 shrink-0', {
  variants: {
    state: {
      asc: 'opacity-70',
      desc: 'opacity-70',
      idle: 'opacity-0 group-hover/header:opacity-50 group-focus-within/header:opacity-50',
    },
  },
  defaultVariants: { state: 'idle' },
})

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
  'z-50 w-[240px] overflow-hidden rounded-md border border-border bg-popover p-0 shadow-md',
)

/** A single row inside the column panel list. */
export const dataTableColumnItemVariants = cva(
  'flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground',
)

/** The drag handle button inside a column panel row. */
export const dataTableColumnDragHandleVariants = cva(
  'flex cursor-grab items-center rounded p-0.5 text-muted-foreground hover:text-foreground active:cursor-grabbing',
)

/** Empty table body cell copy. */
export const dataTableEmptyStateVariants = cva('h-24 text-center text-muted-foreground')

/** Empty column panel search result. */
export const dataTableEmptyPanelVariants = cva('px-3 py-2 text-sm text-muted-foreground')

/** Locked (always-visible) column row in the panel. */
export const dataTableLockedColumnVariants = cva(
  'flex cursor-default items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground',
)

/** Reset column order control in the panel footer. */
export const dataTableResetColumnVariants = cva(
  'flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground',
)

/** Active filter chip dismiss control in the toolbar. */
export const dataTableFilterChipVariants = cva(
  'inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground',
)

/** Accessible caption below the table — supplementary source / scope note. */
export const dataTableCaptionVariants = cva('pb-3 text-sm-meta italic text-muted-foreground')
