import type {
  EquipmentBudgetSummary,
  EquipmentPickerItem,
  EquipmentPickerSupportedKind,
} from '@rpg/contracts'

import type { EquipmentPickerCharacterPreviewContext } from './equipment-picker-character-preview.lib'

export type {
  EquipmentBudgetSummary,
  EquipmentPickerItem,
  EquipmentPickerItemState,
  EquipmentPickerSupportedKind,
} from '@rpg/contracts'

export const EQUIPMENT_PICKER_TAB_RECOMMENDED = 'recommended'
export const EQUIPMENT_PICKER_TAB_ALL = 'all'

export const EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL = 'Not proficient'

export const EQUIPMENT_PICKER_ADDED_LABEL = 'Added'

/** Sentinel for “all kinds” in the category filter (Radix Select rejects `''`). */
export const EQUIPMENT_PICKER_KIND_ALL = '__all__' as const

export const EQUIPMENT_PICKER_CATEGORY_LABEL = 'Category'

export type EquipmentPickerKindFilter =
  | typeof EQUIPMENT_PICKER_KIND_ALL
  | EquipmentPickerSupportedKind

export type EquipmentPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: readonly EquipmentPickerItem[]
  budget?: EquipmentBudgetSummary
  defaultTab?: typeof EQUIPMENT_PICKER_TAB_RECOMMENDED | typeof EQUIPMENT_PICKER_TAB_ALL
  allowedKinds?: readonly EquipmentPickerSupportedKind[]
  filterOutUnaffordable?: boolean
  filterOutNonProficient?: boolean
  showCharacterPreview?: boolean
  characterPreviewContext?: EquipmentPickerCharacterPreviewContext
  /** Purchased quantities for the active source mode, keyed by equipment id. */
  ownedPurchaseQuantities?: Readonly<Record<string, number>>
  onAddItem: (item: EquipmentPickerItem, quantity: number) => void
}
