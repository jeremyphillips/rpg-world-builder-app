import {
  choiceSubsectionBodyMarginClasses,
  choiceSubsectionHintMarginClasses,
} from './choice-section.variants'

export const choiceBlockRowClasses = 'space-y-3'

export const choiceBlockRowDividerClasses = 'border-t border-border'

export const choiceBlockRowContentClasses = 'space-y-0'

export const choiceBlockRowDetailsClasses = 'space-y-1'

export const choiceBlockRowHeaderClasses =
  'grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1'

export const choiceBlockRowHeaderMainClasses = 'col-start-1 row-start-1 min-w-0'

export const choiceBlockRowHeaderActionClasses = 'col-start-2 row-start-1 shrink-0 self-start'

export const choiceBlockRowHeadingGroupClasses =
  'flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1'

export const choiceBlockRowDetailsGridClasses = 'col-span-2 row-start-2 min-w-0 space-y-1'

export const choiceBlockRowSourceLineClasses = 'text-sm text-foreground'

export const choiceBlockRowPoolDescriptionClasses = choiceSubsectionHintMarginClasses

export const choiceBlockRowOverSelectionClasses = 'text-sm text-destructive'

export const choiceBlockRowSelectedListClasses = `space-y-2 ${choiceSubsectionBodyMarginClasses}`
