import type { ColumnDef, FilterDef } from '@rpg/ui'
import type { Equipment } from '@rpg/contracts'

import { equipmentColumns, equipmentFilters } from '../../components/equipment-columns'
import { serviceColumns, serviceFilters } from '../../services/components/service-columns'
import type { EquipmentFamilyPath } from './equipment-family-paths'

function genericFamilyColumns(campaignId: string): ColumnDef<Equipment>[] {
  return equipmentColumns(campaignId).filter(
    (column) => 'accessorKey' in column && column.accessorKey !== 'kind',
  )
}

const genericFamilyFilters = equipmentFilters.filter((filter) => filter.id !== 'kind')

/** Overview table columns for an equipment family path segment. */
export function getFamilyColumns(
  campaignId: string,
  family: EquipmentFamilyPath,
): ColumnDef<Equipment>[] {
  switch (family) {
    case 'services':
      return serviceColumns(campaignId) as ColumnDef<Equipment>[]
    default:
      return genericFamilyColumns(campaignId)
  }
}

/** Overview table filters for an equipment family path segment. */
export function getFamilyFilters(family: EquipmentFamilyPath): FilterDef[] {
  switch (family) {
    case 'services':
      return serviceFilters
    default:
      return genericFamilyFilters
  }
}
