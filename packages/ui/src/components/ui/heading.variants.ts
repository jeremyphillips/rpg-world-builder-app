import { cva, type VariantProps } from 'class-variance-authority'

export const headingVariants = cva('', {
  variants: {
    variant: {
      display: 'heading-style-display',
      page: 'heading-style-page',
      section: 'heading-style-section',
      subsection: 'heading-style-subsection',
      group: 'heading-style-group',
      card: 'heading-style-card',
      sheetTitle: 'heading-style-sheet-title',
      sheetSection: 'heading-style-sheet-section',
      alert: 'heading-style-alert',
      nav: 'heading-style-nav',
      brand: 'heading-style-brand',
      label: 'heading-style-label',
    },
  },
  defaultVariants: {
    variant: 'page',
  },
})

export type HeadingVariantProps = VariantProps<typeof headingVariants>
