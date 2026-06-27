import { cva, type VariantProps } from 'class-variance-authority'

export const eyebrowVariants = cva('uppercase font-light text-muted-foreground', {
  variants: {
    size: {
      xs: 'text-eyebrow-xs tracking-eyebrow-xs',
      sm: 'text-eyebrow-sm tracking-eyebrow',
      md: 'text-eyebrow-md tracking-eyebrow',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

export type EyebrowVariantProps = VariantProps<typeof eyebrowVariants>
