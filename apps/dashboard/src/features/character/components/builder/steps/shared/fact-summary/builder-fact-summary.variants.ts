import { cn, establishSurfaceCurrent } from '@rpg/ui'

export const builderFactSummaryClasses = cn(
  'relative rounded-md border border-border bg-surface-faint p-4',
  establishSurfaceCurrent('surface-faint'),
)

export const builderFactSummaryHeaderClasses = 'space-y-1'

export const builderFactSummaryDividerClasses = 'mt-4 mb-2 border-t border-border'

export const builderFactSummaryRowsClasses = 'grid gap-3 sm:grid-cols-2'

export const builderFactSummarySimpleRowClasses = 'space-y-0.5'

export const builderFactSummarySimpleLabelClasses = 'text-xs text-muted-foreground'

export const builderFactSummarySimpleValueClasses = 'text-sm font-medium text-foreground'

export const builderFactSummaryGrantedRowsClasses = 'space-y-0'

export const builderFactSummaryGrantedRowClasses =
  'grid grid-cols-[auto_minmax(6.75rem,8.25rem)_minmax(0,1fr)] items-center gap-x-4 gap-y-2'

export const builderFactSummaryCategoryLabelClasses = 'text-sm font-medium text-foreground'

export const builderFactSummarySourceGroupsClasses = 'min-w-0'

export const builderFactSummarySourceGroupClasses =
  'grid grid-cols-[minmax(0,1fr)_var(--builder-fact-summary-source-width,max-content)] items-center gap-x-4'

export const builderFactSummaryStackedSourceGroupClasses =
  'border-b border-border-subtle pb-1.5 mb-1.5 last:border-b-0 last:pb-0 last:mb-0'

export const builderFactSummaryValueLabelsClasses = 'min-w-0 text-sm text-foreground'

export const builderFactSummarySourceLabelClasses = 'text-left text-xs text-muted-foreground'

export const builderFactSummaryRowDividerClasses = 'my-2 border-t border-border'
