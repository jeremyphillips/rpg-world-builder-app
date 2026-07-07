import type { Equipment } from '../../../../content/equipment'
import { getEquipmentKindLabel } from '../../../../content/equipment'

function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Search text for equipment picker ranking — name, kind, tags, and plain description. */
export function buildEquipmentPickerSearchText(equipment: Equipment): string {
  const tagText = equipment.tags?.join(' ') ?? ''

  return [
    equipment.name,
    equipment.slug,
    getEquipmentKindLabel(equipment.kind),
    tagText || undefined,
    equipment.description ? stripHtmlTags(equipment.description) : undefined,
  ]
    .filter(Boolean)
    .join(' ')
}
