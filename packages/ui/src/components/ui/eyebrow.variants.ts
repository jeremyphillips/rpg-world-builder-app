import { cva, type VariantProps } from 'class-variance-authority'

export const eyebrowVariants = cva('', {
  variants: {
    size: {
      xs: 'eyebrow-style-xs',
      sm: 'eyebrow-style-sm',
      md: 'eyebrow-style-md',
    },
    tone: {
      muted: 'text-muted-foreground',
      foreground: 'text-foreground',
      primary: 'text-primary',
    },
  },
  defaultVariants: {
    size: 'sm',
    tone: 'muted',
  },
})

export type EyebrowVariantProps = VariantProps<typeof eyebrowVariants>
