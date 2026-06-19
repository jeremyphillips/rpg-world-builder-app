import { pickEquipment } from '../lib/fixtures/pick'

export const TORCH = pickEquipment('torch')
export const ARROWS = pickEquipment('arrows')
export const ORB = pickEquipment('orb')
export const RIDING_HORSE = pickEquipment('riding-horse')
export const ROWBOAT = pickEquipment('rowboat')

export const EQUIPMENT_LIST = [TORCH, ARROWS, ORB, RIDING_HORSE, ROWBOAT] as const
