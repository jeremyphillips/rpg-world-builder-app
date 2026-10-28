import {
  CHARACTER_EQUIPMENT_INVENTORY_BUCKETS,
  findCanonicalPlainEntry,
  inventoryBucketForEquipment,
  normalizeEquipmentInstance,
  resolveCreatureArmorSlot,
  type CreatureArmorSlot,
  type Equipment,
} from '@rpg/contracts'

import { EQUIPMENT_INVENTORY_GROUP_LABELS } from '../../../equipment/lib/inventory/equipment-inventory-group-labels.lib'

import type { MonsterEquipmentFormEntry } from '../monster-form-values'

export type MonsterPlainStackCreateOptions = {
  /** Applied only when a new plain stack is created. Defaults to equipped. */
  equipped?: boolean
}

export function createPlainMonsterEquipmentEntry(
  equipmentId: string,
  options?: MonsterPlainStackCreateOptions,
): MonsterEquipmentFormEntry {
  return normalizeEquipmentInstance({
    entryId: crypto.randomUUID(),
    equipmentId,
    quantity: 1,
    equipped: options?.equipped ?? true,
  }) as MonsterEquipmentFormEntry
}

/** Adjusts only the canonical plain stack for an equipment id; customized stacks are untouched. */
export function setMonsterPlainStackQuantity(
  entries: readonly MonsterEquipmentFormEntry[],
  equipmentId: string,
  targetQuantity: number,
  createOptions?: MonsterPlainStackCreateOptions,
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

  const created = createPlainMonsterEquipmentEntry(equipmentId, createOptions)
  return [...entries, { ...created, quantity: targetQuantity }]
}

export function incrementMonsterPlainStack(
  entries: readonly MonsterEquipmentFormEntry[],
  equipmentId: string,
  createOptions?: MonsterPlainStackCreateOptions,
): MonsterEquipmentFormEntry[] {
  const plain = findCanonicalPlainEntry(entries, equipmentId) as
    | MonsterEquipmentFormEntry
    | undefined
  const current = plain?.quantity ?? 0
  return setMonsterPlainStackQuantity(
    entries,
    equipmentId,
    current + 1,
    plain ? undefined : createOptions,
  )
}

/**
 * Drops every owned entry in `slot` and appends one equipped quantity-1 entry.
 * Weapons and other gear stay in place.
 */
export function replaceMonsterArmorSlotEntry(
  entries: readonly MonsterEquipmentFormEntry[],
  slot: CreatureArmorSlot,
  equipmentId: string,
  catalog: ReadonlyMap<string, Equipment>,
): MonsterEquipmentFormEntry[] {
  const kept = entries.filter(
    (entry) => resolveCreatureArmorSlot(catalog.get(entry.equipmentId)) !== slot,
  )
  return [...kept, createPlainMonsterEquipmentEntry(equipmentId, { equipped: true })]
}

/** Applies {@link incrementMonsterPlainStack} for each id in order — one coordinated loadout update. */
export function incrementMonsterPlainStacks(
  entries: readonly MonsterEquipmentFormEntry[],
  equipmentIds: readonly string[],
  createOptions?: MonsterPlainStackCreateOptions,
): MonsterEquipmentFormEntry[] {
  return equipmentIds.reduce(
    (acc, equipmentId) => incrementMonsterPlainStack(acc, equipmentId, createOptions),
    [...entries],
  )
}

/**
 * Groups monster equipment rows by inventory bucket order.
 * Unresolved catalog ids use the gear bucket label for display only (not persisted kind).
 */
export function groupMonsterEquipmentByKind(
  entries: readonly MonsterEquipmentFormEntry[],
  catalog: ReadonlyMap<string, Equipment>,
): { groupLabel: string; entries: MonsterEquipmentFormEntry[] }[] {
  const buckets = new Map<
    keyof typeof EQUIPMENT_INVENTORY_GROUP_LABELS,
    MonsterEquipmentFormEntry[]
  >()

  for (const entry of entries) {
    const item = catalog.get(entry.equipmentId)
    const bucket = item ? inventoryBucketForEquipment(item) : 'gear'
    const group = buckets.get(bucket) ?? []
    group.push(entry)
    buckets.set(bucket, group)
  }

  return CHARACTER_EQUIPMENT_INVENTORY_BUCKETS.flatMap((bucket) => {
    const bucketEntries = buckets.get(bucket)
    if (!bucketEntries?.length) return []
    return [{ groupLabel: EQUIPMENT_INVENTORY_GROUP_LABELS[bucket], entries: bucketEntries }]
  })
}
