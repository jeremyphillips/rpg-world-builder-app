import {
  buildEquipmentPickerSearchText,
  getEquipmentSearchDescription,
  getEquipmentSearchKindLabel,
  getEquipmentSearchName,
  type Equipment,
  type EquipmentPickerItem,
} from '@rpg/contracts'
import type { SearchDocument, SearchField } from '@rpg/search'

/**
 * Assembles an equipment picker search document.
 * Name is primary, kind and each tag are keywords, and description is secondary.
 * The slug stays inside `combined` only — it is an identifier, not a keyword.
 */
export function assembleEquipmentPickerSearchDocument(equipment: Equipment): SearchDocument {
  const description = getEquipmentSearchDescription(equipment)
  const fields: SearchField[] = [
    { key: 'name', text: getEquipmentSearchName(equipment), role: 'primary' },
    { key: 'kind', text: getEquipmentSearchKindLabel(equipment), role: 'keyword' },
    ...(equipment.tags ?? []).map((tag, index) => ({
      key: `tag:${index}`,
      text: tag,
      role: 'keyword' as const,
    })),
  ]

  if (description) {
    fields.push({ key: 'description', text: description, role: 'secondary' })
  }

  fields.push({
    key: 'combined',
    text: buildEquipmentPickerSearchText(equipment),
    role: 'secondary',
  })

  return { id: equipment.id, fields }
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
