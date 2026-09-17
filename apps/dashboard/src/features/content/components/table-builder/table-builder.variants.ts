// ---------------------------------------------------------------------------
// Table builder layout — two-column authoring + preview on desktop, stacked on
// narrow layouts. The xl modal already goes full-screen below `md`.
// ---------------------------------------------------------------------------

/** Authoring ~60% / preview ~40%, collapsing to one column below `lg`. */
export const tableBuilderLayoutClasses =
  'grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'

export const tableBuilderAuthoringPaneClasses = 'flex min-w-0 flex-col gap-6'

/** Preview stays visible while the authoring pane scrolls the modal body. */
export const tableBuilderPreviewPaneClasses = 'min-w-0 lg:sticky lg:top-0 lg:self-start'

/** Neutral bordered editor group — the container owns border and radius. */
export const tableBuilderGroupClasses = 'overflow-hidden rounded-md border border-border'

export const tableBuilderGroupListClasses = 'divide-y divide-border'

/** Padded slot keeping the add action inside the group's content area (not a footer strip). */
export const tableBuilderAddActionWrapClasses = 'p-2'

/** Full-width inset add action — its own bordered button within the padded slot. */
export const tableBuilderAddActionClasses =
  'flex w-full items-center justify-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50'

export const tableBuilderAddActionIconClasses = 'size-4'

export const tableBuilderGroupEmptyClasses = 'px-3 py-4 text-sm text-muted-foreground'

export const tableBuilderSectionErrorClasses = 'text-sm text-destructive'

export const tableBuilderSectionClasses = 'flex flex-col gap-2'
