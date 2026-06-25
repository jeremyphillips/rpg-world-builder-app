import type { ColumnDef, FilterDef } from '@rpg/ui'
import type { Equipment } from '@rpg/contracts'

import type { EquipmentFamilyPath } from './equipment-family-paths'

export type FamilyTableConfig = {
  columns: ColumnDef<Equipment>[]
  filters: FilterDef[]
}

async function loadGenericFamilyTableConfig(campaignId: string): Promise<FamilyTableConfig> {
  const { equipmentColumns, equipmentFilters } = await import('../../components/equipment-columns')
  return {
    columns: equipmentColumns(campaignId).filter(
      (column) => 'accessorKey' in column && column.accessorKey !== 'kind',
    ),
    filters: equipmentFilters.filter((filter) => filter.id !== 'kind'),
  }
}

/** Loads overview table columns and filters for one equipment family on demand. */
export async function loadFamilyTableConfig(
  campaignId: string,
  family: EquipmentFamilyPath,
): Promise<FamilyTableConfig> {
  switch (family) {
    case 'services': {
      const { serviceColumns, serviceFilters } = await import(
        '../../services/components/service-columns'
      )
      return {
        columns: serviceColumns(campaignId) as ColumnDef<Equipment>[],
        filters: serviceFilters,
      }
    }
    case 'mounts': {
      const { mountColumns, mountFilters } = await import('../../mounts/components/mount-columns')
      return {
        columns: mountColumns(campaignId) as ColumnDef<Equipment>[],
        filters: mountFilters,
      }
    }
    case 'tools': {
      const { toolColumns, toolFilters } = await import('../../tools/components/tool-columns')
      return {
        columns: toolColumns(campaignId) as ColumnDef<Equipment>[],
        filters: toolFilters,
      }
    }
    case 'magic-items': {
      const { magicItemColumns, magicItemFilters } = await import(
        '../../magic-items/components/magic-item-columns'
      )
      return {
        columns: magicItemColumns(campaignId) as ColumnDef<Equipment>[],
        filters: magicItemFilters,
      }
    }
    case 'adventuring-gear': {
      const { adventuringGearColumns, adventuringGearFilters } = await import(
        '../../adventuring-gear/components/adventuring-gear-columns'
      )
      return {
        columns: adventuringGearColumns(campaignId) as ColumnDef<Equipment>[],
        filters: adventuringGearFilters,
      }
    }
    case 'vehicles': {
      const { vehicleColumns, vehicleFilters } = await import(
        '../../vehicles/components/vehicle-columns'
      )
      return {
        columns: vehicleColumns(campaignId) as ColumnDef<Equipment>[],
        filters: vehicleFilters,
      }
    }
    case 'armor': {
      const { armorColumns, armorFilters } = await import('../../armor/components/armor-columns')
      return {
        columns: armorColumns(campaignId) as ColumnDef<Equipment>[],
        filters: armorFilters,
      }
    }
    case 'weapons': {
      const { weaponColumns, weaponFilters } = await import(
        '../../weapons/components/weapon-columns'
      )
      return {
        columns: weaponColumns(campaignId) as ColumnDef<Equipment>[],
        filters: weaponFilters,
      }
    }
    default:
      return loadGenericFamilyTableConfig(campaignId)
  }
}
