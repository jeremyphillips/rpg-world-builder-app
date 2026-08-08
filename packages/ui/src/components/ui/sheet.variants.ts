import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { dialogPanelBodyVariants } from './dialog-panel.variants'
import { establishSurfaceCurrent } from './surface-current.lib'

/**
 * Side panel built on Radix Dialog — reuses the modal overlay token and applies
 * edge-anchored slide animations instead of a centered panel.
 */
export const sheetContentVariants = cva(
  cn(
    'fixed z-50 flex h-full flex-col overflow-hidden shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out',
  ),
  {
    variants: {
      side: {
        right:
          'inset-y-0 right-0 w-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        left: 'inset-y-0 left-0 w-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
      },
      surface: {
        card: cn(
          'border-card-border bg-card text-card-foreground',
          establishSurfaceCurrent('card'),
        ),
        background: cn(
          'border-border bg-background text-foreground',
          establishSurfaceCurrent('background'),
        ),
      },
      size: {
        md: 'max-w-md',
        lg: 'max-w-[550px]',
      },
    },
    defaultVariants: {
      side: 'right',
      surface: 'card',
      size: 'md',
    },
  },
)

/** Sheet body — shared dialog-panel body + flex growth for edge panels. */
export const sheetBodyVariants = cva(cn(dialogPanelBodyVariants(), 'flex-1'))

/** Shared docked footer surface — consumed by Sheet.Footer and FormActionsBar sheet variant. */
export const sheetFooterChromeClasses =
  'z-20 shrink-0 border-t border-border bg-background supports-[backdrop-filter]:bg-background/95 supports-[backdrop-filter]:backdrop-blur-sm'

/**
 * Dock vertical rhythm for FormActionsBar sheet footers.
 * Horizontal inset comes from {@link dialogPanelSectionInsetXClasses}, not a Form padding SSOT.
 */
export const sheetFooterDockVerticalRhythmClasses = 'pt-4 pb-4'

export type SheetContentVariantProps = VariantProps<typeof sheetContentVariants>
export type SheetSide = NonNullable<SheetContentVariantProps['side']>
export type SheetSurface = NonNullable<SheetContentVariantProps['surface']>
export type SheetSize = NonNullable<SheetContentVariantProps['size']>
