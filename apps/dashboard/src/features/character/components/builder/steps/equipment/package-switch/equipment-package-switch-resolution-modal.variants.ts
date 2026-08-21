import { cva } from 'class-variance-authority'

/** Modal title — inherit shared dialogTitle; keep outline reset only. */
export const equipmentPackageSwitchResolutionModalHeadlineClasses = 'outline-none'

export const equipmentPackageSwitchResolutionModalBodyClasses =
  'flex min-h-0 min-w-0 flex-col gap-4'

export const equipmentPackageSwitchResolutionModalInventoryScrollClasses =
  'max-h-72 min-w-0 overflow-y-auto overflow-x-hidden pe-3'

export const equipmentPackageSwitchResolutionBudgetSummaryClasses =
  'rounded-lg border border-border bg-surface-muted p-4'

export const equipmentPackageSwitchResolutionBudgetSummaryTitleClasses =
  'mb-3 text-sm font-medium text-foreground'

export const equipmentPackageSwitchResolutionBudgetRowClasses =
  'flex items-start justify-between gap-4 text-sm'

export const equipmentPackageSwitchResolutionBudgetLabelClasses = 'text-muted-foreground'

export const equipmentPackageSwitchResolutionBudgetValueClasses =
  'shrink-0 tabular-nums text-foreground'

export const equipmentPackageSwitchResolutionBudgetStatusVariants = cva(
  'shrink-0 tabular-nums font-medium',
  {
    variants: {
      tone: {
        warning: 'text-destructive',
        success: 'text-semantic-success',
        neutral: 'text-foreground',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
)

export const equipmentPackageSwitchResolutionSafetyNoteClasses = 'text-sm text-muted-foreground'

export const equipmentPackageSwitchResolutionAlertClasses = 'text-sm text-destructive'

export const equipmentPackageSwitchResolutionFooterClasses = 'flex flex-col items-end gap-2'

export const equipmentPackageSwitchResolutionFooterActionsClasses = 'flex items-center gap-2'

export const equipmentPackageSwitchResolutionHelperClasses = 'text-sm text-muted-foreground'

export const equipmentPackageSwitchResolutionBlockedBodyClasses =
  'space-y-3 text-sm text-muted-foreground'
