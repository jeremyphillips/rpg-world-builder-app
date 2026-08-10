import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { cardBorderClasses } from './card.variants'
import { establishSurfaceCurrent } from './surface-current.lib'

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
 * Reserved block-size for `Modal.Content layout="stable"`. Single authoritative
 * definition — do not duplicate in features or modal implementation.
 */
export const modalStableBlockSizeClasses = 'h-[min(85vh,40rem)]'

/**
 * The centered modal panel. `size` caps the max-width; the panel itself is
 * height-capped (`max-h-[85vh]`) and clips its overflow so the scrollable region
 * lives in `Modal.Body`, keeping the header/footer pinned.
 *
 * `layout="stable"` applies {@link modalStableBlockSizeClasses} for a fixed shell
 * block-size; scroll ownership stays on `Modal.Body` / `stableBody`.
 *
 * Surface is locked to `background` — no `surface` prop (do not add for API parity
 * with Sheet). Size values/maps stay modality-owned (`ModalSize` ≠ `SheetSize`).
 */
export const modalContentVariants = cva(
  cn(
    'fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-background text-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    cardBorderClasses,
    establishSurfaceCurrent('background'),
  ),
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
      },
      layout: {
        content: '',
        stable: modalStableBlockSizeClasses,
      },
    },
    defaultVariants: {
      size: 'md',
      layout: 'content',
    },
  },
)

export type ModalContentVariantProps = VariantProps<typeof modalContentVariants>
export type ModalSize = NonNullable<ModalContentVariantProps['size']>
export type ModalContentLayout = NonNullable<ModalContentVariantProps['layout']>
