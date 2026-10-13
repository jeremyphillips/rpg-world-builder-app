import {
  joinInlineMetadata,
  normalizeEquipmentInstance,
  type EquipmentInstance,
} from '@rpg/contracts'

type NormalizedEquipmentEntry = ReturnType<typeof normalizeEquipmentInstance>

const MECHANICAL_CUSTOMIZATION_KEYS = ['magicProperties', 'adjustments', 'modifiers'] as const

const CUSTOMIZATION_REMOVAL_SUMMARY_ROWS: ReadonlyArray<{
  readCount: (entry: NormalizedEquipmentEntry) => number
  singular: string
  plural: string
}> = [
  {
    readCount: (entry) => entry.magicProperties?.length ?? 0,
    singular: 'magic property',
    plural: 'magic properties',
  },
  {
    readCount: (entry) => entry.adjustments?.length ?? 0,
    singular: 'adjustment',
    plural: 'adjustments',
  },
  {
    readCount: (entry) => entry.modifiers?.length ?? 0,
    singular: 'modifier',
    plural: 'modifiers',
  },
]

function hasEquipmentAuthoringText(entry: NormalizedEquipmentEntry): boolean {
  return Boolean(entry.customName?.trim() || entry.customDescription?.trim())
}

function formatEquipmentRemovalInlineCount(
  count: number,
  singular: string,
  plural: string,
): string {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`
}

/** Authored overrides and mechanical edits — not loadout/plain-stack semantics. */
export function equipmentEntryHasMeaningfulCustomization(entry: EquipmentInstance): boolean {
  const normalized = normalizeEquipmentInstance(entry)
  if (hasEquipmentAuthoringText(normalized)) return true
  return MECHANICAL_CUSTOMIZATION_KEYS.some((key) => (normalized[key]?.length ?? 0) > 0)
}

export function formatEquipmentCustomizationRemovalSummary(
  entry: EquipmentInstance,
): string | undefined {
  const normalized = normalizeEquipmentInstance(entry)
  const segments = CUSTOMIZATION_REMOVAL_SUMMARY_ROWS.flatMap((row) => {
    const count = row.readCount(normalized)
    return count > 0 ? [formatEquipmentRemovalInlineCount(count, row.singular, row.plural)] : []
  })
  if (hasEquipmentAuthoringText(normalized)) segments.push('custom text')
  return segments.length > 0 ? joinInlineMetadata(segments) : undefined
}
