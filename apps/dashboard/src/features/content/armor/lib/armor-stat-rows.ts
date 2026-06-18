import type { Armor } from '@rpg/contracts'
import { formatMoney, formatWeight, getArmorAcDisplay, getArmorCategoryLabel } from '@rpg/contracts'

import type { ContentStatRowData } from '../../lib/content-stat-rows'
import { titleCase } from '../../lib/title-case'

export function getArmorStatRows(item: Armor): ContentStatRowData[] {
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
    { label: 'Cost', value: formatMoney(item.cost) },
  ]
}
