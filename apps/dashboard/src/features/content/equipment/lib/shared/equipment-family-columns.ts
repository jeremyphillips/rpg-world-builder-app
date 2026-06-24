import type { ColumnDef, FilterDef } from '@rpg/ui'
import type { Equipment } from '@rpg/contracts'

import { equipmentColumns, equipmentFilters } from '../../components/equipment-columns'
import { serviceColumns, serviceFilters } from '../../services/components/service-columns'
import { mountColumns, mountFilters } from '../../mounts/components/mount-columns'
import { toolColumns, toolFilters } from '../../tools/components/tool-columns'
import { magicItemColumns, magicItemFilters } from '../../magic-items/components/magic-item-columns'
import {
  adventuringGearColumns,
  adventuringGearFilters,
} from '../../adventuring-gear/components/adventuring-gear-columns'
import { vehicleColumns, vehicleFilters } from '../../vehicles/components/vehicle-columns'
import { armorColumns, armorFilters } from '../../armor/components/armor-columns'
import { weaponColumns, weaponFilters } from '../../weapons/components/weapon-columns'
import type { EquipmentFamilyPath } from './equipment-family-paths'

function genericFamilyColumns(campaignId: string): ColumnDef<Equipment>[] {
  return equipmentColumns(campaignId).filter(
    (column) => 'accessorKey' in column && column.accessorKey !== 'kind',
  )
}

const genericFamilyFilters = equipmentFilters.filter((filter) => filter.id !== 'kind')

/** Per-family overview table columns registered by URL path segment. */
const familyColumns: Partial<
  Record<EquipmentFamilyPath, (campaignId: string) => ColumnDef<Equipment>[]>
> = {
  services: (campaignId) => serviceColumns(campaignId) as ColumnDef<Equipment>[],
  mounts: (campaignId) => mountColumns(campaignId) as ColumnDef<Equipment>[],
  tools: (campaignId) => toolColumns(campaignId) as ColumnDef<Equipment>[],
  'magic-items': (campaignId) => magicItemColumns(campaignId) as ColumnDef<Equipment>[],
  'adventuring-gear': (campaignId) => adventuringGearColumns(campaignId) as ColumnDef<Equipment>[],
  vehicles: (campaignId) => vehicleColumns(campaignId) as ColumnDef<Equipment>[],
  armor: (campaignId) => armorColumns(campaignId) as ColumnDef<Equipment>[],
  weapons: (campaignId) => weaponColumns(campaignId) as ColumnDef<Equipment>[],
}

/** Per-family overview table filters registered by URL path segment. */
const familyFilters: Partial<Record<EquipmentFamilyPath, FilterDef[]>> = {
  services: serviceFilters,
  mounts: mountFilters,
  tools: toolFilters,
  'magic-items': magicItemFilters,
  'adventuring-gear': adventuringGearFilters,
  vehicles: vehicleFilters,
  armor: armorFilters,
  weapons: weaponFilters,
}

/** Overview table columns for an equipment family path segment. */
export function getFamilyColumns(
  campaignId: string,
  family: EquipmentFamilyPath,
): ColumnDef<Equipment>[] {
  return familyColumns[family]?.(campaignId) ?? genericFamilyColumns(campaignId)
}

/** Overview table filters for an equipment family path segment. */
export function getFamilyFilters(family: EquipmentFamilyPath): FilterDef[] {
  return familyFilters[family] ?? genericFamilyFilters
}
