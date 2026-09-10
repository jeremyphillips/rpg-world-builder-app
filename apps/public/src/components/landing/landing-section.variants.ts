import { cva, type VariantProps } from 'class-variance-authority'

export const landingSectionVariants = cva('px-6 py-20 sm:py-24', {
  variants: {
    surface: {
      default: 'bg-background',
      muted: 'bg-surface-muted',
    },
  },
  defaultVariants: {
    surface: 'default',
  },
})

export type LandingSectionVariantProps = VariantProps<typeof landingSectionVariants>

export const landingSectionInnerClasses = 'mx-auto flex w-full max-w-5xl flex-col gap-12'

export const landingSectionHeaderClasses =
  'mx-auto flex max-w-2xl flex-col items-center gap-3 text-center'
