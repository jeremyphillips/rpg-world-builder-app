import { cva, type VariantProps } from 'class-variance-authority'

export const eyebrowVariants = cva('', {
  variants: {
    size: {
      xs: 'eyebrow-style-xs',
      sm: 'eyebrow-style-sm',
      md: 'eyebrow-style-md',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

export type EyebrowVariantProps = VariantProps<typeof eyebrowVariants>
