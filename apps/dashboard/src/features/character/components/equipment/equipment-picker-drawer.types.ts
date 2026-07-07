import type { EquipmentBudgetSummary, EquipmentKind, EquipmentPickerItem } from '@rpg/contracts'

export type {
  EquipmentBudgetSummary,
  EquipmentPickerItem,
  EquipmentPickerItemState,
} from '@rpg/contracts'

export const EQUIPMENT_PICKER_TAB_RECOMMENDED = 'recommended'
export const EQUIPMENT_PICKER_TAB_ALL = 'all'

export const EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL = 'Not proficient'

export type EquipmentPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: readonly EquipmentPickerItem[]
  budget?: EquipmentBudgetSummary
  defaultTab?: typeof EQUIPMENT_PICKER_TAB_RECOMMENDED | typeof EQUIPMENT_PICKER_TAB_ALL
  allowedKinds?: readonly EquipmentKind[]
  filterOutUnaffordable?: boolean
  filterOutNonProficient?: boolean
  onAddItem: (item: EquipmentPickerItem, quantity: number) => void
}
