import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'

export const UI_DATA_TABLE_ROW_ACTION_ITEM_CLASS = 'ui-data-table__row-action-item' as const

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

/** Row action dropdown menu item — compact text + sm glyph. */
export function dataTableRowActionItemClasses(destructive?: boolean): string {
  return cn(
    'text-xs',
    UI_DATA_TABLE_ROW_ACTION_ITEM_CLASS,
    destructive && 'text-destructive focus:text-destructive',
  )
}
