import { isArmorEquipment, isWeaponEquipment, type Equipment } from '../../equipment'
import type { MagicPropertyAppliesTo } from './magic-property'

export function equipmentMagicPropertyAppliesTo(
  item: Equipment,
  appliesTo: readonly MagicPropertyAppliesTo[],
): boolean {
  if (isWeaponEquipment(item)) return appliesTo.includes('weapon')
  if (isArmorEquipment(item)) {
    return item.category === 'shields' ? appliesTo.includes('shield') : appliesTo.includes('armor')
  }
  return false
}
