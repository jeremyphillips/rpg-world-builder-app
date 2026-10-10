import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Shared caption typography. Filter captions and the floated label both read
 * this recipe. Size is `sm` | `md` only — there is no form-field tone.
 */
export const fieldCaptionTypographyVariants = cva('', {
  variants: {
    size: {
      sm: 'text-style-caption',
      md: 'text-style-supporting',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type FieldCaptionSize = NonNullable<
  VariantProps<typeof fieldCaptionTypographyVariants>['size']
>
