import { cva, type VariantProps } from 'class-variance-authority'

export const textVariants = cva('', {
  variants: {
    variant: {
      body: 'text-foreground',
      muted: 'text-muted-foreground',
      small: 'text-sm text-muted-foreground',
      caption: 'text-xs italic text-muted-foreground',
      emphasis: 'text-sm font-body-emphasis',
      option: 'text-sm font-body leading-none',
      lead: 'text-lg text-muted-foreground',
      destructive: 'text-sm text-destructive',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
})

export type TextVariantProps = VariantProps<typeof textVariants>
