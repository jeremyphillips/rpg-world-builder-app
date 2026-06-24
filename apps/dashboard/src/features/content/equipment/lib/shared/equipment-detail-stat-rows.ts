import type { Equipment } from '@rpg/contracts'
import { isArmorEquipment, isWeaponEquipment } from '@rpg/contracts'

import { getArmorStatRows } from '../../armor/lib/armor-stat-rows'
import type { ContentStatRowData } from '../../../lib/content-stat-rows'
import { getWeaponStatRows } from '../../../weapons/lib/weapon-stat-rows'
import { getServiceStatRows } from '../../services/lib/service-stat-rows'
import { getMountStatRows } from '../../mounts/lib/mount-stat-rows'
import { getToolStatRows } from '../../tools/lib/tool-stat-rows'
import { getMagicItemStatRows } from '../../magic-items/lib/magic-item-stat-rows'
import { getAdventuringGearStatRows } from '../../adventuring-gear/lib/adventuring-gear-stat-rows'
import { getVehicleStatRows } from '../../vehicles/lib/vehicle-stat-rows'

type StatRow = ContentStatRowData

/** Kind-specific stat rows for unified equipment detail (excludes kind and cost). */
export function getEquipmentKindStatRows(item: Equipment): StatRow[] {
  if (isWeaponEquipment(item)) return getWeaponStatRows(item).filter((row) => row.label !== 'Cost')
  if (isArmorEquipment(item)) return getArmorStatRows(item).filter((row) => row.label !== 'Cost')

  switch (item.kind) {
    case 'adventuring_gear':
      return getAdventuringGearStatRows(item)
    case 'tool':
      return getToolStatRows(item)
    case 'mount':
      return getMountStatRows(item)
    case 'vehicle':
      return getVehicleStatRows(item)
    case 'service':
      return getServiceStatRows(item)
    case 'magic_item':
      return getMagicItemStatRows(item)
  }
}
