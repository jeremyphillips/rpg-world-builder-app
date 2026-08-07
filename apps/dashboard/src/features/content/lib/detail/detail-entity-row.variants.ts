import { cva } from 'class-variance-authority'

export const detailEntityRowVariants = cva('flex items-center justify-between gap-4 px-4 py-2')

export const detailEntityRowContentVariants = cva('min-w-0 flex-1')

export const detailEntityRowHeadingVariants = cva('flex min-w-0 items-baseline gap-x-1 text-sm')

export const detailEntityRowHeadingNameVariants = cva(
  'inline-block min-w-0 max-w-[60%] shrink-0 truncate font-medium text-foreground',
)

export const detailEntityRowHeadingSeparatorVariants = cva(
  'shrink-0 font-normal text-muted-foreground',
)

export const detailEntityRowHeadingSuffixVariants = cva(
  'min-w-0 flex-1 truncate font-normal text-muted-foreground',
)

export const detailEntityRowSubheadingVariants = cva('text-xs text-muted-foreground')
