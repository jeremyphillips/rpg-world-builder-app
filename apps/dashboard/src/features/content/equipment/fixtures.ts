import { pickEquipment } from '../lib/fixtures/pick'

export const TORCH = pickEquipment('torch')
export const ARROWS = pickEquipment('arrows')
export const ORB = pickEquipment('orb')
export const RIDING_HORSE = pickEquipment('riding-horse')
export const ROWBOAT = pickEquipment('rowboat')
export const LONGSWORD = pickEquipment('longsword')
export const LEATHER = pickEquipment('leather-armor')
export const BRACERS_OF_DEFENSE = pickEquipment('bracers-of-defense')

export const EQUIPMENT_LIST = [
  TORCH,
  ARROWS,
  ORB,
  RIDING_HORSE,
  ROWBOAT,
  LONGSWORD,
  LEATHER,
  BRACERS_OF_DEFENSE,
] as const
