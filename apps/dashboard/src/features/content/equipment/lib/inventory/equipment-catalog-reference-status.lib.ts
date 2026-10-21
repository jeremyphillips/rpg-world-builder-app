import { EQUIPMENT_CATALOG_REFERENCE_UNAVAILABLE_MESSAGE } from '@/lib/equipment/equipment-catalog-reference-status.lib'

import type { EntitySummaryStatusItem } from '../../../lib/entity/summary/entity-summary-status.types'

export { EQUIPMENT_CATALOG_REFERENCE_UNAVAILABLE_MESSAGE }

export function equipmentCatalogReferenceUnavailableStatusItem(): EntitySummaryStatusItem {
  return {
    kind: 'text',
    variant: 'warning',
    label: EQUIPMENT_CATALOG_REFERENCE_UNAVAILABLE_MESSAGE,
  }
}

/** Prepends unavailable status when the inventory row has no resolved catalog item. */
export function mergeEquipmentInventoryCatalogReferenceStatus(
  status: readonly EntitySummaryStatusItem[],
  catalogMissing: boolean,
): readonly EntitySummaryStatusItem[] {
  if (!catalogMissing) return status
  const unavailable = equipmentCatalogReferenceUnavailableStatusItem()
  if (
    status.some((item) => {
      if (item.kind !== 'text') return false
      return item.label === EQUIPMENT_CATALOG_REFERENCE_UNAVAILABLE_MESSAGE
    })
  ) {
    return status
  }
  return [unavailable, ...status]
}
