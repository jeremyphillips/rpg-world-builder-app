import { cn, interactiveFocusVariants } from '@rpg/ui'

export const equipmentPickerPurchaseRowClasses = 'flex items-center justify-between gap-3 text-sm'

export const equipmentPickerPurchaseQuantityRowClasses = equipmentPickerPurchaseRowClasses

export const equipmentPickerPurchaseDividerClasses = 'border-b border-border'

/**
 * Optical inset on the quantity stepper — shifts the control toward the label without
 * margin bleed (see body wash `-ml-2` / inner `pl-2` pairing in item-details variants).
 */
export const equipmentPickerPurchaseQuantityStepperShimClasses = 'relative right-2 shrink-0'

export const equipmentPickerPurchaseInsetPanelClasses =
  'rounded border border-border-subtle bg-surface-subtle px-3 py-2'

export const equipmentPickerPurchaseInsetPanelContentClasses = 'space-y-3'

export const equipmentPickerPurchaseRemoveActionClasses = cn(
  'text-sm text-muted-foreground underline-offset-4 hover:text-destructive hover:underline',
  interactiveFocusVariants({ context: 'standalone' }),
)

export const equipmentPickerPurchaseRemoveActionsClasses = 'flex flex-wrap gap-x-4 gap-y-1'
