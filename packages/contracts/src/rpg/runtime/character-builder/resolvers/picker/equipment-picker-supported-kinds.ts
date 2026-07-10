import type { Equipment, EquipmentKind } from '../../../../content/equipment'
import { EQUIPMENT_KINDS } from '../../../../content/equipment'

/**
 * Equipment kinds surfaced in the character builder equipment picker.
 * Vehicles and services remain catalog content but are not addable loadout items.
 */
export const EQUIPMENT_PICKER_SUPPORTED_KINDS = [
  'weapon',
  'armor',
  'adventuring_gear',
  'tool',
  'mount',
  'magic_item',
] as const satisfies readonly EquipmentKind[]

export type EquipmentPickerSupportedKind = (typeof EQUIPMENT_PICKER_SUPPORTED_KINDS)[number]

export function isEquipmentPickerSupportedKind(
  kind: EquipmentKind,
): kind is EquipmentPickerSupportedKind {
  return (EQUIPMENT_PICKER_SUPPORTED_KINDS as readonly string[]).includes(kind)
}

export function isEquipmentPickerSupportedEquipment(
  equipment: Pick<Equipment, 'kind'>,
): equipment is Extract<Equipment, { kind: EquipmentPickerSupportedKind }> {
  return isEquipmentPickerSupportedKind(equipment.kind)
}

/** Kinds excluded from the picker — kept in sync with the supported-kind allowlist. */
export const EQUIPMENT_PICKER_EXCLUDED_KINDS = EQUIPMENT_KINDS.filter(
  (kind) => !isEquipmentPickerSupportedKind(kind),
)
