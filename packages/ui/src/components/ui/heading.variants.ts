import { cva, type VariantProps } from 'class-variance-authority'

export const headingVariants = cva('tracking-tight', {
  variants: {
    variant: {
      page: 'text-2xl font-semibold',
      display: 'text-3xl font-bold',
      section: 'text-xl font-semibold',
      card: 'font-display text-lg font-semibold leading-none',
      alert: 'font-semibold leading-none',
      nav: 'text-base font-semibold',
      brand: 'text-lg font-semibold',
      label: 'font-medium',
    },
  },
  defaultVariants: {
    variant: 'page',
  },
})

export type HeadingVariantProps = VariantProps<typeof headingVariants>
