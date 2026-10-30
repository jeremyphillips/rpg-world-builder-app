import type { ColumnDef } from '@rpg/ui'
import type {
  ArmorClassRules,
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
  const { equipmentColumns, equipmentOverviewFilterSchema } =
    await import('../../lib/equipment-overview-columns')
  return {
    columns: equipmentColumns(campaignId, usage).filter(
      (column) => 'accessorKey' in column && column.accessorKey !== 'kind',
    ),
    filterSchema: omitContentFilterField(
      equipmentOverviewFilterSchema,
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
  armorClassRules?: ArmorClassRules,
): Promise<FamilyTableConfig> {
  switch (family) {
    case 'services': {
      const { serviceColumns, serviceOverviewFilterSchema } =
        await import('../../services/lib/service-overview-columns')
      return {
        columns: serviceColumns(campaignId, usage) as ColumnDef<Equipment>[],
        filterSchema: serviceOverviewFilterSchema as FamilyTableConfig['filterSchema'],
      }
    }
    case 'mounts': {
      const { mountColumns, mountOverviewFilterSchema } =
        await import('../../mounts/lib/mount-overview-columns')
      return {
        columns: mountColumns(campaignId, usage) as ColumnDef<Equipment>[],
        filterSchema: mountOverviewFilterSchema as FamilyTableConfig['filterSchema'],
      }
    }
    case 'tools': {
      const { toolColumns, toolOverviewFilterSchema } =
        await import('../../tools/lib/tool-overview-columns')
      return {
        columns: toolColumns(campaignId, usage) as ColumnDef<Equipment>[],
        filterSchema: toolOverviewFilterSchema as FamilyTableConfig['filterSchema'],
      }
    }
    case 'magic-items': {
      const { magicItemColumns, magicItemOverviewFilterSchema } =
        await import('../../magic-items/lib/magic-item-overview-columns')
      return {
        columns: magicItemColumns(campaignId, usage) as ColumnDef<Equipment>[],
        filterSchema: magicItemOverviewFilterSchema as FamilyTableConfig['filterSchema'],
      }
    }
    case 'adventuring-gear': {
      const { adventuringGearColumns, adventuringGearOverviewFilterSchema } =
        await import('../../adventuring-gear/lib/adventuring-gear-overview-columns')
      return {
        columns: adventuringGearColumns(campaignId, usage) as ColumnDef<Equipment>[],
        filterSchema: adventuringGearOverviewFilterSchema as FamilyTableConfig['filterSchema'],
      }
    }
    case 'vehicles': {
      const { vehicleColumns, vehicleOverviewFilterSchema } =
        await import('../../vehicles/lib/vehicle-overview-columns')
      return {
        columns: vehicleColumns(campaignId, usage) as ColumnDef<Equipment>[],
        filterSchema: vehicleOverviewFilterSchema as FamilyTableConfig['filterSchema'],
      }
    }
    case 'armor': {
      if (!armorClassRules) {
        throw new Error('Armor Class rules are required for the armor overview')
      }
      const { armorColumns, armorOverviewFilterSchema } =
        await import('../../armor/lib/armor-overview-columns')
      return {
        columns: armorColumns(campaignId, usage, armorClassRules) as ColumnDef<Equipment>[],
        filterSchema: armorOverviewFilterSchema as FamilyTableConfig['filterSchema'],
      }
    }
    case 'weapons': {
      const { weaponColumns, weaponOverviewFilterSchema } =
        await import('../../weapons/lib/weapon-overview-columns')
      return {
        columns: weaponColumns(campaignId, usage) as ColumnDef<Equipment>[],
        filterSchema: weaponOverviewFilterSchema as FamilyTableConfig['filterSchema'],
      }
    }
    default:
      return loadGenericFamilyTableConfig(campaignId, usage)
  }
}
