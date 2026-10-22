import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { borderStrength } from './border-strength'
import { dialogPanelFill, dialogPanelGeometry } from './dialog-panel.variants'

/**
 * Side panel built on Radix Dialog — reuses the modal overlay token and applies
 * edge-anchored slide animations instead of a centered panel.
 */
export const sheetContentVariants = cva(
  cn(
    'ui-dialog-panel fixed z-50 shadow-lg data-[state=closed]:duration-150 data-[state=open]:duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
    borderStrength(),
  ),
  {
    variants: {
      side: {
        right: `inset-y-0 right-0 h-full w-full ${dialogPanelGeometry('side-right')} data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right`,
        left: `inset-y-0 left-0 h-full w-full ${dialogPanelGeometry('side-left')} data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left`,
        bottom: `inset-x-0 bottom-0 h-[90dvh] max-h-[90dvh] w-full ${dialogPanelGeometry('side-bottom')} data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom`,
      },
      surface: {
        card: dialogPanelFill('card'),
        background: dialogPanelFill('background'),
        'field-container': dialogPanelFill('field-container'),
        'surface-lift': dialogPanelFill('surface-lift'),
      },
      size: {
        md: 'max-w-md',
        lg: 'max-w-[550px]',
      },
    },
    compoundVariants: [
      {
        side: 'bottom',
        class: 'max-w-none',
      },
    ],
    defaultVariants: {
      side: 'right',
      surface: 'card',
      size: 'md',
    },
  },
)

/** Sheet-owned dock placement — no border, padding, or fill (see dialog-panel footer chrome). */
export const sheetFooterDockClasses = 'shrink-0 z-20'

export type SheetContentVariantProps = VariantProps<typeof sheetContentVariants>
export type SheetSide = NonNullable<SheetContentVariantProps['side']>
export type SheetSurface = NonNullable<SheetContentVariantProps['surface']>
export type SheetSize = NonNullable<SheetContentVariantProps['size']>
