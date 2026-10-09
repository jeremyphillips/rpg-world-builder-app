import { cn, establishSurfaceCurrent } from '@rpg/ui'

export const equipmentPickerInventorySummaryPanelClasses = cn(
  'rounded border border-border bg-surface-faint px-3 py-2',
  establishSurfaceCurrent('surface-faint'),
)

export const equipmentPickerInventorySummaryRowClasses =
  'flex items-center justify-between gap-3 text-sm'

export const equipmentPickerInventorySummaryDividerClasses = 'border-b border-border'
