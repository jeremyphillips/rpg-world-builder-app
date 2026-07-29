import type { Equipment } from '../../../../content/equipment'
import { getEquipmentKindLabel } from '../../../../content/equipment'

function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Primary picker label for equipment search documents. */
export function getEquipmentSearchName(equipment: Equipment): string {
  return equipment.name
}

/** URL-safe identifier included in picker search text. */
export function getEquipmentSearchSlug(equipment: Equipment): string {
  return equipment.slug
}

/** Human-readable kind label for equipment search documents. */
export function getEquipmentSearchKindLabel(equipment: Equipment): string {
  return getEquipmentKindLabel(equipment.kind)
}

/** Space-delimited tag text for equipment search documents. */
export function getEquipmentSearchTags(equipment: Equipment): string {
  return equipment.tags?.join(' ') ?? ''
}

/** Plain-text description for equipment search documents. */
export function getEquipmentSearchDescription(equipment: Equipment): string {
  return equipment.description ? stripHtmlTags(equipment.description) : ''
}

/** Search text for equipment picker ranking — name, kind, tags, and plain description. */
export function buildEquipmentPickerSearchText(equipment: Equipment): string {
  return [
    getEquipmentSearchName(equipment),
    getEquipmentSearchSlug(equipment),
    getEquipmentSearchKindLabel(equipment),
    getEquipmentSearchTags(equipment) || undefined,
    getEquipmentSearchDescription(equipment) || undefined,
  ]
    .filter(Boolean)
    .join(' ')
}
