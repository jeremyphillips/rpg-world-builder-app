import type { EquipmentBudgetSummary, EquipmentKind, EquipmentPickerItem } from '@rpg/contracts'

import type { EquipmentPickerCharacterPreviewContext } from './equipment-picker-character-preview.lib'

export type {
  EquipmentBudgetSummary,
  EquipmentPickerItem,
  EquipmentPickerItemState,
} from '@rpg/contracts'

export const EQUIPMENT_PICKER_TAB_RECOMMENDED = 'recommended'
export const EQUIPMENT_PICKER_TAB_ALL = 'all'

export const EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL = 'Not proficient'

export const EQUIPMENT_PICKER_IN_INVENTORY_LABEL = 'In inventory'

export const EQUIPMENT_PICKER_ADD_QUANTITY_LABEL = 'Quantity to add'

export type EquipmentPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: readonly EquipmentPickerItem[]
  budget?: EquipmentBudgetSummary
  defaultTab?: typeof EQUIPMENT_PICKER_TAB_RECOMMENDED | typeof EQUIPMENT_PICKER_TAB_ALL
  allowedKinds?: readonly EquipmentKind[]
  filterOutUnaffordable?: boolean
  filterOutNonProficient?: boolean
  showCharacterPreview?: boolean
  characterPreviewContext?: EquipmentPickerCharacterPreviewContext
  /** Purchased quantities for the active source mode, keyed by equipment id. */
  ownedPurchaseQuantities?: Readonly<Record<string, number>>
  isUniqueEquipmentOwned?: (equipmentId: string) => boolean
  onAddItem: (item: EquipmentPickerItem, quantity: number) => void
}
