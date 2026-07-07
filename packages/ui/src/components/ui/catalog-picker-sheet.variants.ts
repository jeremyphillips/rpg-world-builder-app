import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { sheetBodyVariants } from './sheet.variants'

export const catalogPickerSheetContentVariants = cva('max-w-xl sm:max-w-2xl')

export const catalogPickerSheetToolbarVariants = cva('space-y-4 px-6 pb-4')

export const catalogPickerSheetSearchRowVariants = cva('relative')

export const catalogPickerSheetBodyVariants = cva(cn(sheetBodyVariants(), 'pt-0'))

export const catalogPickerSheetListVariants = cva('space-y-2')

export const catalogPickerSheetItemVariants = cva(
  'rounded-md border border-border bg-card text-card-foreground',
)

export const catalogPickerSheetItemMainVariants = cva('flex items-start gap-2 p-3')

export const catalogPickerSheetItemDetailsVariants = cva(
  'border-t border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground',
)

export const catalogPickerSheetEmptyVariants = cva(
  'rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground',
)

export const catalogPickerSheetLoadingVariants = cva('flex justify-center py-12')
