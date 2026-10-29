import { cn, panelVariants, type ChoiceSelectionCounterProps } from '@rpg/ui'

export const QUICK_NPC_CREATE_CHOICE_SELECTION_COUNTER_SIZE = 'sm' as const satisfies NonNullable<
  ChoiceSelectionCounterProps['size']
>

/** Outer shell — transparent panel frame; rows own inset. */
export const quickNpcStartingChoicesClasses = cn(
  panelVariants({ tone: 'transparent', density: 'compact', bleed: true }),
  'grid grid-cols-[max-content_minmax(0,1fr)_auto]',
)

export const quickNpcStartingChoiceRowClasses =
  'col-span-3 grid grid-cols-subgrid border-b border-border last:border-b-0'

export const quickNpcStartingChoiceRowHeaderClasses =
  'col-span-3 grid grid-cols-subgrid items-center gap-x-5 px-3 py-2.5 text-left'

export const quickNpcStartingChoiceRowEyebrowSlotClasses = 'col-start-1 shrink-0'

export const quickNpcStartingChoiceRowSummarySlotClasses =
  'col-start-2 min-w-0 truncate text-style-label'

/** Status dot + caret — column 3 so rows without summary text stay end-aligned. */
export const quickNpcStartingChoiceRowActionsClasses =
  'col-start-3 flex min-h-control-action-compact shrink-0 items-center justify-end gap-1.5'

export const quickNpcStartingChoiceRowStatusSlotClasses =
  'flex size-2.5 shrink-0 items-center justify-center'

// TODO(disclosure): consolidate caret rotation with shared collapsible caret CVA in @rpg/ui.
export const quickNpcStartingChoiceRowCaretClasses =
  'shrink-0 text-muted-foreground transition-transform duration-200'

export const quickNpcStartingChoiceRowCaretExpandedClasses = 'rotate-180'

export const quickNpcStartingChoiceExpandedPanelClasses = 'col-span-3 px-3 pb-3'

export const quickNpcStartingChoiceInnerSectionClasses =
  'flex flex-col gap-y-2 border-b border-border pb-3 last:border-b-0 last:pb-0 [&:not(:first-child)]:pt-3'

/** Spacing between {@link EntityCardStaticRenderer} choice rows (builder choice-block parity). */
export const quickNpcStartingChoiceSelectedListClasses = 'flex flex-col gap-y-2'

export const quickNpcAdditionalEquipmentQuantityClasses =
  'shrink-0 text-style-body-compact font-body-emphasis'

export const quickNpcStartingChoiceOptionsContainerClasses = 'flex flex-col'

/** 8px above a + Add control. Applied only when selected rows sit above it. */
export const quickNpcStartingChoiceAddControlClasses = 'mt-2'

export const quickNpcStartingChoiceStatusAfterOptionsClasses = 'mt-2'

export const quickNpcStartingChoiceHeadingClasses = 'text-base font-body-emphasis text-foreground'

export const quickNpcStartingChoiceHeadingRowClasses =
  'flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1'

export const quickNpcStartingChoiceSubsectionDescriptionClasses = 'text-style-caption'

export const quickNpcStartingChoiceProvenanceClasses = 'text-style-supporting'

export const quickNpcStartingChoiceAllowanceHintClasses = 'text-style-caption'

export const quickNpcStartingChoiceIdentityStackClasses = 'flex min-w-0 flex-col gap-y-0.5'

export const quickNpcStartingChoiceStatusRowClasses =
  'flex flex-wrap items-center justify-between gap-x-2 gap-y-1'

export const quickNpcStartingChoiceEmptyClasses = 'text-style-supporting'

export const quickNpcStartingChoiceAddFooterClasses = 'col-span-3 flex justify-center px-3 py-2'

export const quickNpcStartingChoiceSuggestionHintClasses = 'text-style-caption'
