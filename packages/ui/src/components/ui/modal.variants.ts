import { cva, type VariantProps } from 'class-variance-authority'

/**
 * The dimming scrim behind a modal. Uses the `--overlay` design token (never a
 * hardcoded color) and the `tw-animate-css` `data-[state]` enter/exit fades.
 * Shared by the `Modal` and `ConfirmDialog` primitives so the backdrop stays
 * consistent.
 */
export const modalOverlayVariants = cva(
  'fixed inset-0 z-50 bg-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
)

/**
 * The centered modal panel. `size` caps the max-width; the panel itself is
 * height-capped (`max-h-[85vh]`) and clips its overflow so the scrollable region
 * lives in `Modal.Body`, keeping the header/footer pinned.
 */
export const modalContentVariants = cva(
  'fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export const modalBodyVariants = cva('overflow-y-auto p-6 pt-0 text-sm')

export type ModalContentVariantProps = VariantProps<typeof modalContentVariants>
export type ModalSize = NonNullable<ModalContentVariantProps['size']>
