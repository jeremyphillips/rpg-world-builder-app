import { cva } from 'class-variance-authority'

export const detailEntityRowVariants = cva('flex items-center justify-between gap-4', {
  variants: {
    inset: {
      self: 'px-4 py-2',
      parent: '',
    },
  },
  defaultVariants: {
    inset: 'self',
  },
})

export const detailEntityRowContentVariants = cva('min-w-0 flex-1')

export const detailEntityRowSubheadingVariants = cva('text-xs text-muted-foreground')
