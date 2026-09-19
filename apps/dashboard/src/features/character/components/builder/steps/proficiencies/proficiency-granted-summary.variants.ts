import { cn, establishSurfaceCurrent } from '@rpg/ui'

export const proficiencyGrantedSummaryClasses = cn(
  'rounded-md border border-border bg-surface-faint p-4',
  establishSurfaceCurrent('surface-faint'),
)

export const proficiencyGrantedSummaryHeaderClasses = 'space-y-1'

export const proficiencyGrantedSummaryDividerClasses = 'my-4 border-t border-border'

export const proficiencyGrantedSummaryRowsClasses = 'space-y-4'

export const proficiencyGrantedSummaryRowClasses = 'grid grid-cols-[auto_1fr] items-start gap-3'

export const proficiencyGrantedSummaryRowContentClasses = 'min-w-0 space-y-2'

export const proficiencyGrantedSummaryCategoryLabelClasses = 'text-sm font-medium text-foreground'

export const proficiencyGrantedSummarySourceGroupClasses = 'space-y-0.5'

export const proficiencyGrantedSummaryValueLabelsClasses = 'text-sm text-muted-foreground'

export const proficiencyGrantedSummarySourceLabelClasses = 'text-sm text-muted-foreground'
