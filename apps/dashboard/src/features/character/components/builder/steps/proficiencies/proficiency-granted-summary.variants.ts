import { cn, establishSurfaceCurrent } from '@rpg/ui'

export const proficiencyGrantedSummaryClasses = cn(
  'relative rounded-md border border-border bg-surface-faint p-4',
  establishSurfaceCurrent('surface-faint'),
)

export const proficiencyGrantedSummaryHeaderClasses = 'space-y-1'

export const proficiencyGrantedSummaryDividerClasses = 'mt-4 mb-2 border-t border-border'

export const proficiencyGrantedSummaryRowsClasses = 'space-y-0'

export const proficiencyGrantedSummaryRowClasses =
  'grid grid-cols-[auto_minmax(6.75rem,8.25rem)_minmax(0,1fr)] items-center gap-x-4 gap-y-2'

export const proficiencyGrantedSummaryCategoryLabelClasses = 'text-sm font-medium text-foreground'

export const proficiencyGrantedSummarySourceGroupsClasses = 'min-w-0'

export const proficiencyGrantedSummarySourceGroupClasses =
  'grid grid-cols-[minmax(0,1fr)_var(--proficiency-granted-summary-source-width,max-content)] items-center gap-x-4'

export const proficiencyGrantedSummaryStackedSourceGroupClasses =
  'border-b border-border-subtle pb-1.5 mb-1.5 last:border-b-0 last:pb-0 last:mb-0'

export const proficiencyGrantedSummaryValueLabelsClasses = 'min-w-0 text-sm text-foreground'

export const proficiencyGrantedSummarySourceLabelClasses = 'text-left text-xs text-muted-foreground'

export const proficiencyGrantedSummaryRowDividerClasses = 'my-2 border-t border-border'
