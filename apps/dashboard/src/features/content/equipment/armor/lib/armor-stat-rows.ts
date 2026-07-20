import type { ArmorEquipment } from '@rpg/contracts'
import {
  formatEquipmentCostLabel,
  formatWeight,
  getArmorAcDisplay,
  getArmorCategoryLabel,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../../lib/detail/content-stat-rows'
import { titleCase } from '../../../lib/utils/title-case'

/** Stat rows for armor equipment detail (excludes kind; includes cost). */
export function getArmorStatRows(item: ArmorEquipment): ContentStatRowData[] {
  return [
    { label: 'Category', value: getArmorCategoryLabel(item.category) },
    { label: 'AC', value: getArmorAcDisplay(item) },
    ...(item.maxDexBonus !== undefined
      ? [{ label: 'Max Dex Bonus', value: String(item.maxDexBonus) }]
      : []),
    {
      label: 'Stealth',
      value: item.stealthDisadvantage ? 'Disadvantage' : '—',
    },
    ...(item.strengthRequirement !== undefined
      ? [{ label: 'Strength Required', value: String(item.strengthRequirement) }]
      : []),
    ...(item.material ? [{ label: 'Material', value: titleCase(item.material) }] : []),
    ...(item.weight ? [{ label: 'Weight', value: formatWeight(item.weight) }] : []),
    { label: 'Cost', value: formatEquipmentCostLabel(item.cost) ?? 'No market price' },
  ]
}
