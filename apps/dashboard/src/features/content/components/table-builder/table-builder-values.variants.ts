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

export const tableBuilderValuesCellClasses = 'min-w-0 space-y-1'

export const tableBuilderValuesCellErrorClasses = 'text-xs text-destructive'

export const tableBuilderValuesRowBlockedHintClasses =
  'col-span-full text-xs text-muted-foreground -mt-0.5'

export const tableBuilderValuesDiceCellClasses = 'flex min-w-0 items-center gap-1'

export const tableBuilderValuesDiceCountClasses = 'w-12'

export const tableBuilderValuesDiceJoinerClasses = 'text-xs text-muted-foreground'

export const tableBuilderValuesActionCellClasses = 'flex justify-end'

/** Column track widths: level select, one flexible track per column, trailing action. */
export const TABLE_BUILDER_LEVEL_TRACK = '5.5rem'
export const TABLE_BUILDER_VALUE_TRACK = 'minmax(7rem, 1fr)'
export const TABLE_BUILDER_ACTION_TRACK = '2.25rem'

export function tableBuilderValuesGridTemplate(
  columnCount: number,
  includeLevel = true,
  includeActions = true,
  includeRestoreActions = false,
): string {
  const valueTracks = `repeat(${Math.max(columnCount, 1)}, ${TABLE_BUILDER_VALUE_TRACK})`
  const restoreTrack = includeRestoreActions ? ` ${TABLE_BUILDER_ACTION_TRACK}` : ''
  const actionTrack = includeActions ? ` ${TABLE_BUILDER_ACTION_TRACK}` : ''
  return includeLevel
    ? `${TABLE_BUILDER_LEVEL_TRACK} ${valueTracks}${restoreTrack}${actionTrack}`
    : `${valueTracks}${restoreTrack}${actionTrack}`
}

export const tableBuilderValuesStickyPaddingClasses = 'pb-14'

/** Pinned extended-progression chrome — lives outside the modal scrollport, above the footer. */
export const tableBuilderAuthoringDockBarClasses = 'border-t border-border bg-background py-2'

export const tableBuilderAuthoringDockPanelClasses = 'space-y-1.5'

export const tableBuilderAuthoringDockWellClasses = 'w-full'

export const tableBuilderAuthoringDockTriggerClasses = 'text-sm font-medium'

export const tableBuilderAuthoringDockHeadingClasses = 'mb-1.5 text-base'

export const tableBuilderAuthoringDockHeadingTitleClasses = 'font-semibold text-foreground'

export const tableBuilderAuthoringDockHeadingMetaClasses = 'font-normal text-muted-foreground'

export const tableBuilderAuthoringDockFootnoteTextClasses = 'mb-0 text-xs text-muted-foreground'

export const tableBuilderAuthoringDockInputRowClasses =
  'flex flex-wrap items-center gap-x-2 gap-y-1'

export const tableBuilderAuthoringDockInputLabelClasses =
  'shrink-0 text-sm font-medium text-foreground'

export const tableBuilderAuthoringDockIncrementInputClasses = 'w-24'

/** Overlays the modal body scrollport — must not participate in flex height allocation. */
export const tableBuilderAuthoringDockShellClasses = 'absolute inset-x-0 bottom-0 z-10'

/** Matches authoring/preview column tracks without scroll-end padding. */
export const tableBuilderAuthoringDockLayoutClasses =
  'grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'

/** Reserves the preview column track so dock chrome aligns with the values grid. */
export const tableBuilderAuthoringDockPreviewSpacerClasses = 'hidden min-w-0 lg:block'

export const tableBuilderValuesLevelLabelClasses = 'text-sm text-muted-foreground tabular-nums'

export const tableBuilderDerivedInputShellClasses = cn(
  'grid w-full min-w-0 items-center grid-cols-[1fr_1px_auto]',
  'rounded-md border border-input bg-input shadow-sm transition-colors hover:border-input-hover',
  'focus-within:outline-none focus-within:border-input-focus focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
)

export const tableBuilderDerivedInputFieldClasses = cn(
  'min-w-0 border-0 bg-transparent shadow-none rounded-l-md rounded-r-none',
  'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
)

export const tableBuilderDerivedBadgeDividerClasses =
  'relative z-[1] w-px min-w-px shrink-0 self-stretch bg-border'

export const tableBuilderDerivedBadgeSegmentClasses =
  'inline-flex shrink-0 items-center rounded-l-none rounded-r-md bg-surface-faint px-2'
