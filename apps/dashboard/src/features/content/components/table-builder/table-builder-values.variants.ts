import { cn } from '@rpg/ui'
import { tableHeaderRowClasses } from '@rpg/ui'

// ---------------------------------------------------------------------------
// Values grid — a bordered group that reads as a real table. The outer
// container owns border and radius; the header row uses the shared table header
// band token; body rows stay compact with restrained separators. Wide tables
// scroll horizontally inside the container instead of widening the modal or
// crushing cell controls.
// ---------------------------------------------------------------------------

export const tableBuilderValuesScrollClasses = 'overflow-x-auto'

export const tableBuilderValuesGridClasses = 'min-w-fit'

/** Authoring header row — matches {@link tableHeaderRowClasses} from `@rpg/ui`. */
export const tableBuilderValuesHeaderRowClasses = cn(
  tableHeaderRowClasses,
  'grid items-center gap-2 px-2.5 py-2 text-xs font-medium text-muted-foreground',
)

export const tableBuilderValuesHeaderCellClasses = 'truncate'

export const tableBuilderValuesRowClasses = 'grid items-center gap-2 px-2.5 py-1.5'

export const tableBuilderValuesCellClasses = 'min-w-0'

export const tableBuilderValuesDiceCellClasses = 'flex min-w-0 items-center gap-1'

export const tableBuilderValuesDiceCountClasses = 'w-12'

export const tableBuilderValuesDiceJoinerClasses = 'text-xs text-muted-foreground'

export const tableBuilderValuesActionCellClasses = 'flex justify-end'

/** Column track widths: level select, one flexible track per column, trailing action. */
export const TABLE_BUILDER_LEVEL_TRACK = '5.5rem'
export const TABLE_BUILDER_VALUE_TRACK = 'minmax(7rem, 1fr)'
export const TABLE_BUILDER_ACTION_TRACK = '2.25rem'

export function tableBuilderValuesGridTemplate(columnCount: number, includeLevel = true): string {
  const valueTracks = `repeat(${Math.max(columnCount, 1)}, ${TABLE_BUILDER_VALUE_TRACK})`
  return includeLevel
    ? `${TABLE_BUILDER_LEVEL_TRACK} ${valueTracks} ${TABLE_BUILDER_ACTION_TRACK}`
    : `${valueTracks} ${TABLE_BUILDER_ACTION_TRACK}`
}
