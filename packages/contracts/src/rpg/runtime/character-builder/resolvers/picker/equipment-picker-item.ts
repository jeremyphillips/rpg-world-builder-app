import type { Equipment } from '../../../../content/equipment'
import type { PickerItemStateBase } from './picker-item-state'

export type EquipmentPickerItemState = PickerItemStateBase & {
  isProficient: boolean
  isAffordable: boolean
}

export type EquipmentPickerItem = {
  equipment: Equipment
  state: EquipmentPickerItemState
  searchText: string
}
