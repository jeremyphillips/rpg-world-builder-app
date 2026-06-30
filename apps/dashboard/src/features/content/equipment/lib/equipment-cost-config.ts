import type { EquipmentKind } from '@rpg/contracts'
import type { NumberInputDigits } from '@rpg/ui'

/** Per-equipment-kind cost amount digit width for `InputSelectField`. */
export const EQUIPMENT_COST_VALUE_DIGITS = {
  weapon: 2,
  armor: 3,
  adventuring_gear: 2,
  tool: 3,
  mount: 3,
  vehicle: 5,
  service: 4,
  magic_item: 4,
} as const satisfies Record<EquipmentKind, NumberInputDigits>

export function costValueDigitsForKind(kind: EquipmentKind): NumberInputDigits {
  return EQUIPMENT_COST_VALUE_DIGITS[kind]
}
