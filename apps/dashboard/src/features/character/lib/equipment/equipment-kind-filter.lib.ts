import {
  EQUIPMENT_PICKER_SUPPORTED_KINDS,
  isEquipmentPickerSupportedKind,
  type EquipmentPickerSupportedKind,
} from '@rpg/contracts'

import type { EquipmentPickerItem } from '@/features/character/components/equipment/picker/drawer/equipment-picker-drawer.types'

export function resolveEquipmentPickerAllowedKinds(
  allowedKinds?: readonly EquipmentPickerSupportedKind[],
): EquipmentPickerSupportedKind[] {
  const sourceKinds = allowedKinds ?? EQUIPMENT_PICKER_SUPPORTED_KINDS
  return sourceKinds.filter(isEquipmentPickerSupportedKind)
}

export function resolveEquipmentKindFilterOptions(
  items: readonly EquipmentPickerItem[],
  allowedKinds?: readonly EquipmentPickerSupportedKind[],
): EquipmentPickerSupportedKind[] {
  const kindsInItems = new Set(
    items.map((item) => item.equipment.kind).filter(isEquipmentPickerSupportedKind),
  )
  return resolveEquipmentPickerAllowedKinds(allowedKinds).filter((kind) => kindsInItems.has(kind))
}
