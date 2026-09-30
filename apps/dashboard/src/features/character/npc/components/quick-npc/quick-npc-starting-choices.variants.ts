/** Outer shell — bordered list with aligned summary columns across rows. */
export const quickNpcStartingChoicesClasses =
  'overflow-hidden rounded-md border border-border grid grid-cols-[max-content_minmax(0,1fr)_auto]'

export const quickNpcStartingChoiceRowClasses =
  'col-span-3 grid grid-cols-subgrid border-b border-border last:border-b-0'

export const quickNpcStartingChoiceRowHeaderClasses =
  'col-span-3 grid grid-cols-subgrid items-center gap-x-5 px-3 py-2.5 text-left'

export const quickNpcStartingChoiceRowSummaryClasses = 'min-w-0 truncate text-xs text-foreground'

/** Status dot + caret — fixed dot slot keeps carets aligned when status is `none`. */
export const quickNpcStartingChoiceRowActionsClasses =
  'flex min-h-control-action-compact shrink-0 items-center justify-end gap-1.5'

export const quickNpcStartingChoiceRowStatusSlotClasses =
  'flex size-2.5 shrink-0 items-center justify-center'

export const quickNpcStartingChoiceRowCaretClasses =
  'size-4 shrink-0 text-muted-foreground transition-transform duration-200'

export const quickNpcStartingChoiceRowCaretExpandedClasses = 'rotate-180'

export const quickNpcStartingChoiceExpandedPanelClasses = 'col-span-3 px-3 pb-3'

export const quickNpcStartingChoiceInnerPanelClasses =
  'flex flex-col rounded-md border border-border bg-surface-faint p-3'

export const quickNpcStartingChoiceInnerSectionClasses =
  'flex flex-col gap-y-2 border-b border-border pb-3 last:border-b-0 last:pb-0 [&:not(:first-child)]:pt-3'

/** Spacing between {@link ContentEntityCard} choice rows (builder choice-block parity). */
export const quickNpcStartingChoiceSelectedListClasses = 'flex flex-col gap-y-2'

export const quickNpcStartingChoiceOptionsContainerClasses = 'flex flex-col gap-y-2'

export const quickNpcStartingChoiceStatusAfterOptionsClasses = 'mt-2'

export const quickNpcStartingChoiceHeadingClasses = 'text-base font-body-emphasis text-foreground'

export const quickNpcStartingChoiceProvenanceClasses = 'text-sm text-muted-foreground'

export const quickNpcStartingChoiceAllowanceHintClasses = 'text-xs text-muted-foreground'

export const quickNpcStartingChoiceIdentityStackClasses = 'flex min-w-0 flex-col gap-y-0.5'

export const quickNpcStartingChoiceStatusRowClasses =
  'flex flex-wrap items-center justify-between gap-x-2 gap-y-1'

export const quickNpcStartingChoiceEmptyClasses = 'text-sm text-muted-foreground'

export const quickNpcStartingChoiceAddFooterClasses = 'col-span-3 flex justify-center px-3 py-2'

export const quickNpcStartingChoiceSuggestionHintClasses = 'text-xs text-muted-foreground'
