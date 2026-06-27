import { cva, type VariantProps } from 'class-variance-authority'

export const headingVariants = cva('tracking-tight', {
  variants: {
    variant: {
      display: 'text-heading-display font-bold',
      page: 'text-heading-page font-semibold',
      section: 'text-heading-section font-semibold',
      card: 'font-display text-heading-card font-semibold leading-none',
      alert: 'text-heading-compact font-semibold leading-none',
      nav: 'text-heading-compact font-semibold',
      brand: 'text-heading-compact font-semibold',
      label: 'text-heading-label font-medium',
    },
  },
  defaultVariants: {
    variant: 'page',
  },
})

export type HeadingVariantProps = VariantProps<typeof headingVariants>
