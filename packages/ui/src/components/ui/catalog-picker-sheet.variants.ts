import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { dialogPanelSectionInsetXClasses } from './dialog-panel.variants'

/** Catalog picker results body — default Sheet.Body scrollport; no extra top/bottom overrides. */
export const catalogPickerSheetBodyVariants = cva('')

export const catalogPickerSheetListVariants = cva('space-y-2')

export { insetPanelEmptyStateVariants as catalogPickerSheetEmptyVariants } from './inset-panel.variants'

export const catalogPickerSheetLoadingVariants = cva('flex justify-center py-12')

/** Toolbar bottom padding when an auxiliary action row follows. */
export const catalogPickerToolbarWithAuxiliaryActionVariants = cva('', {
  variants: {
    hasAuxiliaryAction: {
      true: 'pb-0',
      false: '',
    },
  },
  defaultVariants: {
    hasAuxiliaryAction: false,
  },
})

/** Fixed row between toolbar and scrollable results. */
export const catalogPickerAuxiliaryActionRowVariants = cva(
  cn('flex justify-end pt-2 pb-4', dialogPanelSectionInsetXClasses),
)
