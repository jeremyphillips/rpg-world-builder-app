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
export const fieldDerivedMetaRowVariants = 'grid grid-cols-[max-content_1fr] gap-x-3 gap-y-0'

export const fieldDerivedMetaLabelVariants = 'text-fine-sm text-muted-foreground'

export const fieldDerivedMetaValueVariants = 'text-fine-sm text-foreground font-body-emphasis'
