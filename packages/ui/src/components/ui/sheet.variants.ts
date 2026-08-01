import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { establishSurfaceCurrent } from './surface-current.lib'

/**
 * Side panel built on Radix Dialog — reuses the modal overlay token and applies
 * edge-anchored slide animations instead of a centered panel.
 */
export const sheetContentVariants = cva(
  cn(
    'fixed z-50 flex h-full flex-col overflow-hidden bg-card text-card-foreground shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out',
    establishSurfaceCurrent('card'),
  ),
  {
    variants: {
      side: {
        right:
          'inset-y-0 right-0 w-full max-w-md border-l border-card-border data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        left: 'inset-y-0 left-0 w-full max-w-md border-r border-card-border data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
)

export const sheetBodyVariants = cva('flex-1 overflow-y-auto p-6 pt-0 text-sm')

export type SheetContentVariantProps = VariantProps<typeof sheetContentVariants>
export type SheetSide = NonNullable<SheetContentVariantProps['side']>
