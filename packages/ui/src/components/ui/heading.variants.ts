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
      dialogTitle: 'heading-style-dialog-title',
      confirmDialogTitle: 'heading-style-confirm-dialog-title',
      sheetSection: 'heading-style-sheet-section',
      alert: 'heading-style-alert',
      nav: 'heading-style-nav',
      brand: 'heading-style-brand',
      label: 'heading-style-label',
      /** Hero title — 19px mobile, 24px md, page (34px) from lg up. */
      heroTitle: 'heading-style-subsection md:heading-style-sheet-section lg:heading-style-page',
    },
  },
  defaultVariants: {
    variant: 'page',
  },
})

export type HeadingVariantProps = VariantProps<typeof headingVariants>
