import { isArmorEquipment, type Equipment } from '@rpg/contracts'

import type { MonsterEquipmentFormEntry } from '../monster-form-values'

export function equipmentArmorRole(item: Equipment | undefined): 'body-armor' | 'shield' | 'other' {
  if (!item || !isArmorEquipment(item)) return 'other'
  return item.category === 'shields' ? 'shield' : 'body-armor'
}

export function equipmentEntryBaseName(
  entry: Pick<MonsterEquipmentFormEntry, 'equipmentId' | 'customName'>,
  catalog: ReadonlyMap<string, Equipment>,
): string {
  if (entry.customName) return entry.customName
  return catalog.get(entry.equipmentId)?.name ?? entry.equipmentId
}
