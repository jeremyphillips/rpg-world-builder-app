import { cva } from 'class-variance-authority'

/** One-line metadata region — reserve height matches a single meta row. */
export const fieldDerivedMetaRegionVariants = cva('', {
  variants: {
    reserveSpace: {
      true: 'min-h-[1.125rem]',
      false: '',
    },
  },
  defaultVariants: {
    reserveSpace: false,
  },
})

/** Key/value row — label column sizes to content, value fills remainder. */
export const fieldDerivedMetaRowVariants = cva('grid grid-cols-[max-content_1fr] gap-x-3 gap-y-0')

export const fieldDerivedMetaLabelVariants = cva('text-xs-meta text-muted-foreground')

export const fieldDerivedMetaValueVariants = cva('text-xs-meta text-foreground font-body-emphasis')
