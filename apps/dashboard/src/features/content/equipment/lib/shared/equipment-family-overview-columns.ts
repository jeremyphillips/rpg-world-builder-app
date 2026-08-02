import type { ColumnDef } from '@rpg/ui'
import type {
  ContentOverviewUsageScope,
  ContentUsageSummaryLabels,
  Equipment,
  WithCampaignAccess,
} from '@rpg/contracts'
import type { FilterSchema } from '@rpg/ui/filters'

import { omitContentFilterField } from '../../../lib/overview/content-overview-filter-schema'
import type { EquipmentFamilyPath } from './equipment-family-paths'

export type FamilyTableConfig = {
  columns: ColumnDef<Equipment>[]
  filterSchema: FilterSchema<WithCampaignAccess<Equipment>, Record<string, unknown>>
}

async function loadGenericFamilyTableConfig(
  campaignId: string,
  usage?: {
    usageSummaryLabels?: ContentUsageSummaryLabels
    overviewUsageScope?: ContentOverviewUsageScope
  },
): Promise<FamilyTableConfig> {
  const { equipmentColumns, equipmentFilterSchema } =
    await import('../../lib/equipment-overview-columns')
  return {
    columns: equipmentColumns(campaignId, usage).filter(
      (column) => 'accessorKey' in column && column.accessorKey !== 'kind',
    ),
    filterSchema: omitContentFilterField(
      equipmentFilterSchema,
      'kind',
    ) as FamilyTableConfig['filterSchema'],
  }
}

/** Loads overview table columns and filter schemas for one equipment family on demand. */
export async function loadFamilyTableConfig(
  campaignId: string,
  family: EquipmentFamilyPath,
  usage?: {
    usageSummaryLabels?: ContentUsageSummaryLabels
    overviewUsageScope?: ContentOverviewUsageScope
  },
): Promise<FamilyTableConfig> {
  switch (family) {
    case 'services': {
      const { serviceColumns, serviceFilterSchema } =
        await import('../../services/lib/service-overview-columns')
      return {
        columns: serviceColumns(campaignId, usage) as ColumnDef<Equipment>[],
        filterSchema: serviceFilterSchema as FamilyTableConfig['filterSchema'],
      }
    }
    case 'mounts': {
      const { mountColumns, mountFilterSchema } =
        await import('../../mounts/lib/mount-overview-columns')
      return {
        columns: mountColumns(campaignId, usage) as ColumnDef<Equipment>[],
        filterSchema: mountFilterSchema as FamilyTableConfig['filterSchema'],
      }
    }
    case 'tools': {
      const { toolColumns, toolFilterSchema } =
        await import('../../tools/lib/tool-overview-columns')
      return {
        columns: toolColumns(campaignId, usage) as ColumnDef<Equipment>[],
        filterSchema: toolFilterSchema as FamilyTableConfig['filterSchema'],
      }
    }
    case 'magic-items': {
      const { magicItemColumns, magicItemFilterSchema } =
        await import('../../magic-items/lib/magic-item-overview-columns')
      return {
        columns: magicItemColumns(campaignId, usage) as ColumnDef<Equipment>[],
        filterSchema: magicItemFilterSchema as FamilyTableConfig['filterSchema'],
      }
    }
    case 'adventuring-gear': {
      const { adventuringGearColumns, adventuringGearFilterSchema } =
        await import('../../adventuring-gear/lib/adventuring-gear-overview-columns')
      return {
        columns: adventuringGearColumns(campaignId, usage) as ColumnDef<Equipment>[],
        filterSchema: adventuringGearFilterSchema as FamilyTableConfig['filterSchema'],
      }
    }
    case 'vehicles': {
      const { vehicleColumns, vehicleFilterSchema } =
        await import('../../vehicles/lib/vehicle-overview-columns')
      return {
        columns: vehicleColumns(campaignId, usage) as ColumnDef<Equipment>[],
        filterSchema: vehicleFilterSchema as FamilyTableConfig['filterSchema'],
      }
    }
    case 'armor': {
      const { armorColumns, armorFilterSchema } =
        await import('../../armor/lib/armor-overview-columns')
      return {
        columns: armorColumns(campaignId, usage) as ColumnDef<Equipment>[],
        filterSchema: armorFilterSchema as FamilyTableConfig['filterSchema'],
      }
    }
    case 'weapons': {
      const { weaponColumns, weaponFilterSchema } =
        await import('../../weapons/lib/weapon-overview-columns')
      return {
        columns: weaponColumns(campaignId, usage) as ColumnDef<Equipment>[],
        filterSchema: weaponFilterSchema as FamilyTableConfig['filterSchema'],
      }
    }
    default:
      return loadGenericFamilyTableConfig(campaignId, usage)
  }
}
