import type { EquipmentInstance } from '../../content/equipment/instance/instance'

import { isPlainEquipmentEntry } from './equipment-stack'

/** Catalog equipment ids with both a plain and a configured owned entry in the inventory. */
export type EquipmentInventoryUnmodifiedContext = ReadonlySet<string>

function isEligibleOwnedEntry(entry: EquipmentInstance): boolean {
  return (entry.quantity ?? 1) > 0
}

/**
 * Single O(n) pass over inventory entries. Sibling detection uses catalog `equipmentId` only.
 * Classification SSOT: {@link isPlainEquipmentEntry}.
 */
export function buildEquipmentInventoryUnmodifiedContext(
  entries: readonly EquipmentInstance[],
): EquipmentInventoryUnmodifiedContext {
  const plainByEquipmentId = new Set<string>()
  const configuredByEquipmentId = new Set<string>()

  for (const entry of entries) {
    if (!isEligibleOwnedEntry(entry)) continue
    if (isPlainEquipmentEntry(entry)) {
      plainByEquipmentId.add(entry.equipmentId)
    } else {
      configuredByEquipmentId.add(entry.equipmentId)
    }
  }

  const context = new Set<string>()
  for (const equipmentId of plainByEquipmentId) {
    if (configuredByEquipmentId.has(equipmentId)) {
      context.add(equipmentId)
    }
  }
  return context
}

/** True when the entry is plain and another configured stack shares its catalog id. */
export function shouldShowUnmodifiedEquipmentQualifier(
  entry: EquipmentInstance,
  context: EquipmentInventoryUnmodifiedContext,
): boolean {
  if (!isEligibleOwnedEntry(entry)) return false
  if (!isPlainEquipmentEntry(entry)) return false
  return context.has(entry.equipmentId)
}
