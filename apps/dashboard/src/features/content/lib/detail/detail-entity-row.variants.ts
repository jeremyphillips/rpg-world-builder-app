import { cva } from 'class-variance-authority'

export const detailEntityRowVariants = cva('flex items-center justify-between gap-4 px-4 py-2')

export const detailEntityRowContentVariants = cva('min-w-0 flex-1')

export const detailEntityRowHeadingVariants = cva('text-sm font-medium text-foreground')

export const detailEntityRowSubheadingVariants = cva('text-xs text-muted-foreground')
