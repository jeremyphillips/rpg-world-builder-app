import type { EntitySummaryStatusItem } from '../../../lib/entity/summary/entity-summary-status.types'

/** User-facing copy when a saved equipment id is not in the campaign catalog. */
export const EQUIPMENT_CATALOG_REFERENCE_UNAVAILABLE_MESSAGE = 'Equipment reference unavailable'

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
