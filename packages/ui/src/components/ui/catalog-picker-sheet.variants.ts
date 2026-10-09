import { cva } from 'class-variance-authority'

/** Catalog picker results body — default Sheet.Body scrollport; no extra top/bottom overrides. */
export const catalogPickerSheetBodyVariants = cva('')

export const catalogPickerSheetListVariants = cva('space-y-2')

export { insetPanelEmptyStateVariants as catalogPickerSheetEmptyVariants } from './inset-panel.variants'

export const catalogPickerSheetLoadingVariants = cva('flex justify-center py-12')

/**
 * Pinned chrome under the title, inside `Sheet.Header`.
 * The header owns horizontal inset. This stack owns the gap under the title.
 * Bottom padding stays here only when no filter toolbar follows to own the seam.
 */
export const catalogPickerHeaderChromeVariants = cva('flex flex-col gap-4 pt-4', {
  variants: {
    ownsBottomPadding: {
      true: 'pb-4',
      false: '',
    },
  },
  defaultVariants: {
    ownsBottomPadding: false,
  },
})

/** Toolbar plus optional auxiliary action. Gap replaces the auxiliary row's old top padding. */
export const catalogPickerHeaderFilterClusterVariants = cva('flex flex-col gap-2')

/** Toolbar nested in the header. Header owns `px-6`. The reset strip is the bottom inset. */
export const catalogPickerHeaderToolbarVariants = cva('px-0')

/** Last pinned row above the header border. Header owns horizontal inset. */
export const catalogPickerAuxiliaryActionRowVariants = cva('flex justify-end pb-4')
