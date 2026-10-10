import { cva, type VariantProps } from 'class-variance-authority'

/** Shared size token for secondary body copy (15px @ 16px root). */
export const textSecondaryBodyClasses = 'text-md'

export const textVariants = cva('', {
  variants: {
    variant: {
      body: 'text-style-body',
      muted: 'text-style-muted',
      small: 'text-style-small',
      caption: 'text-style-caption',
      emphasis: 'text-style-emphasis',
      option: 'text-style-option',
      lead: 'text-style-lead',
      info: 'text-style-info',
      success: 'text-style-success',
      warning: 'text-style-warning',
      destructive: 'text-style-destructive',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
})

export type TextVariantProps = VariantProps<typeof textVariants>
