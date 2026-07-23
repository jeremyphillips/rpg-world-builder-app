import type { ColumnDef, FilterDef } from '@rpg/ui'
import type { Equipment } from '@rpg/contracts'

import type { EquipmentFamilyPath } from './equipment-family-paths'

export type FamilyTableConfig = {
  columns: ColumnDef<Equipment>[]
  filters: FilterDef<Equipment>[]
}

async function loadGenericFamilyTableConfig(campaignId: string): Promise<FamilyTableConfig> {
  const { equipmentColumns, equipmentFilters } =
    await import('../../lib/equipment-overview-columns')
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
      const { serviceColumns, serviceFilters } =
        await import('../../services/lib/service-overview-columns')
      return {
        columns: serviceColumns(campaignId) as ColumnDef<Equipment>[],
        filters: serviceFilters,
      }
    }
    case 'mounts': {
      const { mountColumns, mountFilters } = await import('../../mounts/lib/mount-overview-columns')
      return {
        columns: mountColumns(campaignId) as ColumnDef<Equipment>[],
        filters: mountFilters,
      }
    }
    case 'tools': {
      const { toolColumns, toolFilters } = await import('../../tools/lib/tool-overview-columns')
      return {
        columns: toolColumns(campaignId) as ColumnDef<Equipment>[],
        filters: toolFilters,
      }
    }
    case 'magic-items': {
      const { magicItemColumns, magicItemFilters } =
        await import('../../magic-items/lib/magic-item-overview-columns')
      return {
        columns: magicItemColumns(campaignId) as ColumnDef<Equipment>[],
        filters: magicItemFilters,
      }
    }
    case 'adventuring-gear': {
      const { adventuringGearColumns, adventuringGearFilters } =
        await import('../../adventuring-gear/lib/adventuring-gear-overview-columns')
      return {
        columns: adventuringGearColumns(campaignId) as ColumnDef<Equipment>[],
        filters: adventuringGearFilters,
      }
    }
    case 'vehicles': {
      const { vehicleColumns, vehicleFilters } =
        await import('../../vehicles/lib/vehicle-overview-columns')
      return {
        columns: vehicleColumns(campaignId) as ColumnDef<Equipment>[],
        filters: vehicleFilters,
      }
    }
    case 'armor': {
      const { armorColumns, armorFilters } = await import('../../armor/lib/armor-overview-columns')
      return {
        columns: armorColumns(campaignId) as ColumnDef<Equipment>[],
        filters: armorFilters,
      }
    }
    case 'weapons': {
      const { weaponColumns, weaponFilters } =
        await import('../../weapons/lib/weapon-overview-columns')
      return {
        columns: weaponColumns(campaignId) as ColumnDef<Equipment>[],
        filters: weaponFilters,
      }
    }
    default:
      return loadGenericFamilyTableConfig(campaignId)
  }
}
