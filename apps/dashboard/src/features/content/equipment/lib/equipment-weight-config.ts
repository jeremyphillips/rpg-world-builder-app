import type { EquipmentKind } from '@rpg/contracts'
import type { NumberInputDigits } from '@rpg/ui'

/** Equipment kinds that expose the shared Economy weight field. */
export const WEIGHT_EQUIPMENT_KINDS = [
  'weapon',
  'armor',
  'adventuring_gear',
  'tool',
  'mount',
  'vehicle',
  'magic_item',
] as const satisfies readonly EquipmentKind[]

export type WeightEquipmentKind = (typeof WEIGHT_EQUIPMENT_KINDS)[number]

/** Per-equipment-kind weight value digit width for `InputSelectField`. */
export const EQUIPMENT_WEIGHT_VALUE_DIGITS = {
  weapon: 2,
  armor: 2,
  adventuring_gear: 2,
  tool: 2,
  magic_item: 2,
  mount: 2,
  vehicle: 3,
} as const satisfies Record<WeightEquipmentKind, NumberInputDigits>

export function weightValueDigitsForKind(kind: WeightEquipmentKind): NumberInputDigits {
  return EQUIPMENT_WEIGHT_VALUE_DIGITS[kind]
}

export function isWeightEquipmentKind(kind: EquipmentKind): kind is WeightEquipmentKind {
  return (WEIGHT_EQUIPMENT_KINDS as readonly EquipmentKind[]).includes(kind)
}
