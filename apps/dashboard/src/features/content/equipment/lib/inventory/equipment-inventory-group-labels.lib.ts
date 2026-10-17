import {
  getEquipmentKindCollectionLabel,
  getEquipmentKindCompactLabel,
  type CharacterEquipment,
} from '@rpg/contracts'

/** Display labels for persisted character inventory buckets (gear uses compact label). */
export const EQUIPMENT_INVENTORY_GROUP_LABELS = {
  weapons: getEquipmentKindCollectionLabel('weapon'),
  armor: getEquipmentKindCollectionLabel('armor'),
  tools: getEquipmentKindCollectionLabel('tool'),
  gear: getEquipmentKindCompactLabel('adventuring_gear'),
  magicItems: getEquipmentKindCollectionLabel('magic_item'),
  vehicles: getEquipmentKindCollectionLabel('vehicle'),
  mounts: getEquipmentKindCollectionLabel('mount'),
} as const satisfies Record<keyof CharacterEquipment, string>
