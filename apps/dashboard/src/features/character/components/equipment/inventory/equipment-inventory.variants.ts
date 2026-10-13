/** One bordered inventory card. Section inset is owned by the equipment feature. */
export const equipmentInventoryPanelClasses = 'overflow-hidden rounded-lg border border-border'

export const equipmentInventorySectionClasses = 'space-y-3 px-4 py-4'

export {
  EQUIPMENT_INVENTORY_SECTION_TITLE_VARIANT,
  equipmentInventoryRowListClasses,
  equipmentPurchasedInventoryCategoryClasses,
  equipmentPurchasedInventoryCategoryListClasses,
} from '@/features/content/equipment/components/inventory-list/equipment-inventory-list.variants'

export const equipmentInventoryPanelDividerClasses = 'border-t border-border'

export const equipmentInventoryRowQuantityClasses = 'flex items-center gap-1.5'

export const equipmentInventoryRowActionsClasses = 'flex shrink-0 items-center'

/** Read-only quantity — 14px, matching the trailing price label. */
export const equipmentInventoryRowQtyLabelClasses = 'shrink-0 text-sm tabular-nums text-foreground'
