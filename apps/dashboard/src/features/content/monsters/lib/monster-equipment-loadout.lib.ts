import { findCanonicalPlainEntry, normalizeEquipmentInstance, type Equipment } from '@rpg/contracts'

import type { MonsterEquipmentFormEntry } from './monster-form-values'

export function createPlainMonsterEquipmentEntry(equipmentId: string): MonsterEquipmentFormEntry {
  return normalizeEquipmentInstance({
    entryId: crypto.randomUUID(),
    equipmentId,
    quantity: 1,
    equipped: true,
  }) as MonsterEquipmentFormEntry
}

/** Adjusts only the canonical plain stack for an equipment id; customized stacks are untouched. */
export function setMonsterPlainStackQuantity(
  entries: readonly MonsterEquipmentFormEntry[],
  equipmentId: string,
  targetQuantity: number,
): MonsterEquipmentFormEntry[] {
  if (targetQuantity <= 0) {
    const plain = findCanonicalPlainEntry(entries, equipmentId) as
      | MonsterEquipmentFormEntry
      | undefined
    if (!plain) return [...entries]
    return entries.filter((entry) => entry.entryId !== plain.entryId)
  }

  const plain = findCanonicalPlainEntry(entries, equipmentId) as
    | MonsterEquipmentFormEntry
    | undefined
  if (plain) {
    return entries.map((entry) =>
      entry.entryId === plain.entryId ? { ...entry, quantity: targetQuantity } : entry,
    )
  }

  const created = createPlainMonsterEquipmentEntry(equipmentId)
  return [...entries, { ...created, quantity: targetQuantity }]
}

export function incrementMonsterPlainStack(
  entries: readonly MonsterEquipmentFormEntry[],
  equipmentId: string,
): MonsterEquipmentFormEntry[] {
  const plain = findCanonicalPlainEntry(entries, equipmentId) as
    | MonsterEquipmentFormEntry
    | undefined
  const current = plain?.quantity ?? 0
  return setMonsterPlainStackQuantity(entries, equipmentId, current + 1)
}

export function groupMonsterEquipmentByKind(
  entries: readonly MonsterEquipmentFormEntry[],
  catalog: ReadonlyMap<string, Equipment>,
  kindLabel: (equipment: Equipment) => string,
): { groupLabel: string; entries: MonsterEquipmentFormEntry[] }[] {
  const order = ['Weapons', 'Armor', 'Gear'] as const
  const buckets = new Map<string, MonsterEquipmentFormEntry[]>()

  for (const entry of entries) {
    const item = catalog.get(entry.equipmentId)
    const label = item ? kindLabel(item) : 'Gear'
    const group = buckets.get(label) ?? []
    group.push(entry)
    buckets.set(label, group)
  }

  const labelsInData = [...buckets.keys()]
  const sortedLabels = [
    ...order.filter((label) => buckets.has(label)),
    ...labelsInData.filter((label) => !order.includes(label as (typeof order)[number])),
  ]

  return sortedLabels.map((groupLabel) => ({
    groupLabel,
    entries: buckets.get(groupLabel) ?? [],
  }))
}
