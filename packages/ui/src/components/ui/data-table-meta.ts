/** Shared `ColumnMeta.columnTone` values for DataTable body cell styling. */
export const dataTableColumnMeta = {
  identity: { columnTone: 'identity' as const },
  data: { columnTone: 'data' as const },
  source: { columnTone: 'source' as const },
  neutral: { columnTone: 'neutral' as const },
  actions: { columnTone: 'actions' as const },
} as const

/** Fixed-width presets for `ColumnMeta.headerClassName` / `cellClassName`. */
export const dataTableColumnWidths = {
  /** Thumbnail column (~64px) — fixed at all breakpoints. */
  image: 'w-16 max-w-16',

  tiny: 'whitespace-nowrap lg:w-20 lg:max-w-20',
  tinyCenter: 'whitespace-nowrap text-center lg:w-20 lg:max-w-20',

  /** Tiny data columns — hit die, AC, level, speed, short enum values. */
  compact: 'whitespace-nowrap lg:w-24 lg:max-w-24',

  /** Tiny centered data columns — booleans, icons, checks. */
  compactCenter: 'whitespace-nowrap text-center lg:w-24 lg:max-w-24',

  /** Short text / enum lists — primary abilities, type, category. */
  medium: 'whitespace-nowrap lg:w-36 lg:max-w-36',

  wide: 'whitespace-nowrap lg:w-48 lg:max-w-48',

  /** Badge/status columns — source, visibility, status. */
  badge: 'whitespace-nowrap lg:w-28 lg:max-w-28',

  /** Actions/menu column. */
  actions: 'w-12 max-w-12',

  /** Shrink-to-fit checkbox column. */
  minimal: 'w-px',
} as const

export type DataTableColumnWidth = keyof typeof dataTableColumnWidths

/** Applies a width preset to both header and body cells. */
export function dataTableWidthMeta(width: DataTableColumnWidth) {
  const className = dataTableColumnWidths[width]
  return { headerClassName: className, cellClassName: className } as const
}
