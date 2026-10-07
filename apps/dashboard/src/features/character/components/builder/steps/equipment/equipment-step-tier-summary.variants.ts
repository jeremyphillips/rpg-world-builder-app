import { cva } from 'class-variance-authority'

import {
  cn,
  establishSurfaceCurrent,
  interactiveFocusVariants,
  interactivePointerClasses,
} from '@rpg/ui'

export const equipmentStepTierSummaryPanelVariants = cva(
  cn(
    'rounded-md border border-border-faint bg-surface-faint px-3 py-2.5',
    establishSurfaceCurrent('surface-faint'),
  ),
)

/** 14px trigger. The benefit count overrides this with text-xs. */
export const equipmentStepTierSummaryTriggerVariants = cva(
  cn(
    'flex w-full min-w-0 items-center gap-3 text-left text-sm',
    interactivePointerClasses,
    interactiveFocusVariants({ context: 'embedded' }),
  ),
)

export const equipmentStepTierSummaryStaticVariants = cva(
  'flex w-full min-w-0 items-center gap-3 text-sm',
)

export const equipmentStepTierSummaryNameVariants = cva('font-medium text-foreground')

export const equipmentStepTierSummaryLevelVariants = cva('font-normal text-muted-foreground')

export const equipmentStepTierSummaryCountVariants = cva('shrink-0 text-xs text-muted-foreground')

export const equipmentStepTierSummaryCaretVariants = cva(
  'size-icon-glyph-sm shrink-0 text-muted-foreground transition-transform',
)

/** 12px rows, 8px between them. Color lives on the columns. */
export const equipmentStepTierSummaryBodyVariants = cva(
  'mt-1 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 text-xs',
)

export const equipmentStepTierSummaryValueVariants = cva(
  'inline-flex items-center justify-end gap-1 text-right',
)
