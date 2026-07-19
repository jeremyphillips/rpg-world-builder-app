import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { sheetBodyVariants } from './sheet.variants'

export const catalogPickerSheetContentVariants = cva('max-w-[550px]')

export const catalogPickerSheetBodyVariants = cva(cn(sheetBodyVariants(), 'pt-0'))

export const catalogPickerSheetListVariants = cva('space-y-2')

export { insetPanelEmptyStateVariants as catalogPickerSheetEmptyVariants } from './inset-panel.variants'

export const catalogPickerSheetLoadingVariants = cva('flex justify-center py-12')
