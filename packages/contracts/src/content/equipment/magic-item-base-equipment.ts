import type { Equipment, EquipmentKind } from '../equipment'

/**
 * Equipment kinds that may be referenced as the physical base of a magic item
 * (`baseEquipmentId` slug). Tools, mounts, vehicles, services, and other magic
 * items are excluded.
 */
export const MAGIC_ITEM_BASE_EQUIPMENT_KINDS = [
  'weapon',
  'armor',
  'adventuring_gear',
] as const satisfies readonly EquipmentKind[]

export type MagicItemBaseEquipmentKind = (typeof MAGIC_ITEM_BASE_EQUIPMENT_KINDS)[number]

export function isMagicItemBaseEquipmentKind(
  kind: EquipmentKind,
): kind is MagicItemBaseEquipmentKind {
  return (MAGIC_ITEM_BASE_EQUIPMENT_KINDS as readonly string[]).includes(kind)
}

export function isMagicItemBaseEquipment(
  equipment: Pick<Equipment, 'kind'>,
): equipment is Extract<Equipment, { kind: MagicItemBaseEquipmentKind }> {
  return isMagicItemBaseEquipmentKind(equipment.kind)
}
