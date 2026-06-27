import { cva, type VariantProps } from 'class-variance-authority'

export const headingVariants = cva('tracking-tight', {
  variants: {
    variant: {
      display: 'text-heading-display font-heading-display',
      page: 'text-heading-page font-heading',
      section: 'text-heading-section font-heading',
      card: 'font-display text-heading-card font-heading leading-none',
      alert: 'text-heading-compact font-heading leading-none',
      nav: 'text-heading-compact font-heading',
      brand: 'text-heading-compact font-heading',
      label: 'text-heading-label font-heading-label',
    },
  },
  defaultVariants: {
    variant: 'page',
  },
})

export type HeadingVariantProps = VariantProps<typeof headingVariants>
