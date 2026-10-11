import { isArmorEquipment, type Equipment } from '@rpg/contracts'

import type { MonsterEquipmentFormEntry } from './monster-form-values'

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

/** Display-only disambiguation when two rows share a catalog name and neither has a custom name. */
export function equipmentEntryReferenceLabel(
  entry: MonsterEquipmentFormEntry,
  entries: readonly MonsterEquipmentFormEntry[],
  catalog: ReadonlyMap<string, Equipment>,
): string {
  if (entry.customName) return entry.customName
  const base = equipmentEntryBaseName(entry, catalog)
  const same = entries.filter(
    (candidate) => !candidate.customName && equipmentEntryBaseName(candidate, catalog) === base,
  )
  if (same.length < 2) return base
  const index = same.findIndex((candidate) => candidate.entryId === entry.entryId)
  return `${base} (${index + 1})`
}
