import {
  dataTableActionsCellVariants,
  dataTableActionsHeaderVariants,
  dataTableCellTextVariants,
  dataTableSelectCellVariants,
  dataTableSelectHeaderVariants,
} from './data-table.variants'

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
  /**
   * Thumbnail column — fixed to `dataTableImageVariants` (+ horizontal padding).
   * 24px image + 16px padding at default; 32px image + 16px padding at lg+.
   */
  image: 'w-10 max-w-10 shrink-0 px-2 lg:w-12 lg:max-w-12',

  /** Primary title/name column — fluid; no fixed width cap. */
  title: 'min-w-0',

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

  /** Collection count columns — compact centered `[ n ]` counters. */
  collectionCount: 'whitespace-nowrap text-center lg:w-[5.5rem] lg:max-w-[5.5rem]',

  /** Actions/menu column — width only; pair with `dataTableWidthMeta('actions')` for sticky chrome. */
  actions: 'w-12 max-w-12 shrink-0',

  /** Row selection checkbox column — pair with `dataTableWidthMeta('select')` for centered chrome. */
  select: 'w-10 max-w-10 shrink-0',

  /** Shrink-to-fit placeholder — prefer `select` for checkbox columns under `table-fixed`. */
  minimal: 'w-px',
} as const

export type DataTableColumnWidth = keyof typeof dataTableColumnWidths

/** Body-cell layout for centered width presets — flex breaks table `align-middle`. */
const dataTableCenteredBodyCellLayout = 'text-center [&>svg]:mx-auto [&>svg]:block'

/** Applies a width preset to both header and body cells. */
export function dataTableWidthMeta(width: DataTableColumnWidth) {
  const className = dataTableColumnWidths[width]
  if (width === 'image') {
    return {
      headerClassName: className,
      cellClassName: `${className} overflow-visible`,
    } as const
  }
  if (width === 'actions') {
    return {
      headerClassName: dataTableActionsHeaderVariants(),
      cellClassName: dataTableActionsCellVariants(),
    } as const
  }
  if (width === 'select') {
    return {
      headerClassName: dataTableSelectHeaderVariants(),
      cellClassName: dataTableSelectCellVariants(),
    } as const
  }
  if (width === 'collectionCount' || width === 'compactCenter' || width === 'tinyCenter') {
    return {
      headerClassName: className,
      cellClassName: `${className} ${dataTableCenteredBodyCellLayout}`,
    } as const
  }
  return { headerClassName: className, cellClassName: className } as const
}

/** Typography presets for `ColumnMeta.cellClassName` or inner cell spans. */
export const dataTableCellTypography = {
  meta: dataTableCellTextVariants({ role: 'meta' }),
  metaItalic: dataTableCellTextVariants({ role: 'metaItalic' }),
  stat: dataTableCellTextVariants({ role: 'stat' }),
} as const

export type DataTableCellTypography = keyof typeof dataTableCellTypography

/** Applies a typography preset to body cells. */
export function dataTableTypographyMeta(role: DataTableCellTypography) {
  return { cellClassName: dataTableCellTypography[role] } as const
}
