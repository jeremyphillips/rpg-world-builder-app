import {
  buildEquipmentPickerSearchText,
  type Equipment,
  type EquipmentPickerItem,
} from '@rpg/contracts'
import type { SearchDocument } from '@rpg/search'

/** Assembles a parity-preserving equipment picker search document from contracts field helpers. */
export function assembleEquipmentPickerSearchDocument(equipment: Equipment): SearchDocument {
  return {
    id: equipment.id,
    fields: [
      {
        key: 'combined',
        text: buildEquipmentPickerSearchText(equipment),
        role: 'primary',
      },
    ],
  }
}

/** Attaches assembled search documents to resolver rows for dashboard picker surfaces. */
export function enrichEquipmentPickerItemsWithSearchDocument(
  items: readonly EquipmentPickerItem[],
): EquipmentPickerItem[] {
  return items.map((item) => ({
    ...item,
    searchDocument: assembleEquipmentPickerSearchDocument(item.equipment),
  }))
}

/** Plain-text accessor for legacy picker chrome that still expects one search string. */
export function getEquipmentPickerSearchText(item: EquipmentPickerItem): string {
  const combinedField = item.searchDocument?.fields.find((field) => field.key === 'combined')
  if (combinedField?.text) return combinedField.text
  return buildEquipmentPickerSearchText(item.equipment)
}
