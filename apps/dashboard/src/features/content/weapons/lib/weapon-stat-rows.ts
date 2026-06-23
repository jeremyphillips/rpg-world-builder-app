import type { Weapon } from '@rpg/contracts'
import {
  formatMoney,
  formatWeight,
  formatWeaponDamage,
  formatWeaponProperties,
  formatWeaponRange,
  getWeaponMasteryEntry,
  getWeaponMasteryLabel,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../lib/content-stat-rows'
import { titleCase } from '../../lib/title-case'

// fallow-ignore-next-line complexity
export function getWeaponStatRows(item: Weapon): ContentStatRowData[] {
  return [
    { label: 'Category', value: titleCase(item.category) },
    { label: 'Mode', value: titleCase(item.mode) },
    ...(item.damage && item.damageType
      ? [
          {
            label: 'Damage',
            value: `${formatWeaponDamage(item.damage)} ${item.damageType}`,
          },
        ]
      : []),
    ...(item.versatileDamage
      ? [{ label: 'Versatile', value: formatWeaponDamage(item.versatileDamage) }]
      : []),
    { label: 'Properties', value: formatWeaponProperties(item.properties) },
    {
      label: 'Mastery',
      value: getWeaponMasteryLabel(item.mastery),
      info: getWeaponMasteryEntry(item.mastery)?.description,
      infoAriaLabel: `About ${getWeaponMasteryLabel(item.mastery)}`,
    },
    ...(item.range ? [{ label: 'Range', value: formatWeaponRange(item.range) }] : []),
    ...(item.weight ? [{ label: 'Weight', value: formatWeight(item.weight) }] : []),
    { label: 'Cost', value: formatMoney(item.cost) },
    ...(item.specialRules ? [{ label: 'Special Rules', value: item.specialRules }] : []),
  ]
}
