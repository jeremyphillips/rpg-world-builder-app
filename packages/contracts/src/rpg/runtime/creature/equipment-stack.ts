import type { EquipmentInstance } from '../../content/equipment/instance/instance'
import { normalizeEquipmentInstance } from '../../content/equipment/instance/normalize-equipment-instance'

export type EquipmentStackEntry = EquipmentInstance & { entryId: string }

function equipmentEntryHasConfiguration(entry: EquipmentInstance): boolean {
  const normalized = normalizeEquipmentInstance(entry)
  if (normalized.customName || normalized.customDescription || normalized.magical) return true
  return [normalized.magicProperties, normalized.adjustments, normalized.modifiers].some(
    (rows) => (rows?.length ?? 0) > 0,
  )
}

/** Plain stack: no display overrides, not magical, no properties or mechanical effects. */
export function isPlainEquipmentEntry(entry: EquipmentInstance): boolean {
  return !equipmentEntryHasConfiguration(entry)
}

export function findCanonicalPlainEntry(
  entries: readonly EquipmentInstance[],
  equipmentId: string,
): EquipmentInstance | undefined {
  const plain = entries.filter(
    (entry) => entry.equipmentId === equipmentId && isPlainEquipmentEntry(entry),
  )
  return plain.find((entry) => entry.equipped === true) ?? plain[0]
}

export type SplitEquipmentEntryInput = {
  newEntryId: string
  patch: Partial<EquipmentInstance>
}

/** Splits one copy from a stack into a new entry inserted after the source. */
export function splitEquipmentEntry<T extends EquipmentInstance & { entryId: string }>(
  entries: readonly T[],
  sourceEntryId: string,
  input: SplitEquipmentEntryInput,
): T[] {
  const sourceIndex = entries.findIndex((entry) => entry.entryId === sourceEntryId)
  if (sourceIndex < 0) return [...entries]
  const source = entries[sourceIndex]!
  if ((source.quantity ?? 1) <= 1) return [...entries]

  const nextSource: T = {
    ...source,
    quantity: (source.quantity ?? 1) - 1,
  }
  const splitEntry: T = normalizeEquipmentInstance({
    ...source,
    ...input.patch,
    entryId: input.newEntryId,
    quantity: input.patch.quantity ?? 1,
  }) as T

  const next = [...entries]
  next[sourceIndex] = nextSource
  next.splice(sourceIndex + 1, 0, splitEntry)
  return next
}

export type EquipmentStackSummary = {
  ownedQuantity: number
  plainEntryId?: string
  plainQuantity: number
  customizedCopyCount: number
}

export function summarizeEquipmentStacks(
  entries: readonly EquipmentInstance[],
): Map<string, EquipmentStackSummary> {
  const byEquipmentId = new Map<string, EquipmentStackSummary>()

  for (const entry of entries) {
    const quantity = entry.quantity ?? 1
    const existing = byEquipmentId.get(entry.equipmentId) ?? {
      ownedQuantity: 0,
      plainQuantity: 0,
      customizedCopyCount: 0,
    }
    existing.ownedQuantity += quantity
    if (isPlainEquipmentEntry(entry)) {
      existing.plainQuantity += quantity
    }
    byEquipmentId.set(entry.equipmentId, existing)
  }

  for (const [equipmentId, summary] of byEquipmentId) {
    const canonical = findCanonicalPlainEntry(entries, equipmentId)
    byEquipmentId.set(equipmentId, {
      ...summary,
      plainEntryId:
        canonical && 'entryId' in canonical && canonical.entryId
          ? canonical.entryId
          : summary.plainEntryId,
      customizedCopyCount: summary.ownedQuantity - summary.plainQuantity,
    })
  }

  return byEquipmentId
}
