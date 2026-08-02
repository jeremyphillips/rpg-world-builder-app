import { z } from 'zod'

import { EQUIPMENT_KIND_LABELS, type EquipmentKind } from '../../vocab/equipment/kind'

/** URL path segments for equipment family overviews (kebab-case). */
export const EQUIPMENT_FAMILY_PATHS = [
  'weapons',
  'armor',
  'adventuring-gear',
  'tools',
  'mounts',
  'vehicles',
  'services',
  'magic-items',
] as const

export type EquipmentFamilyPath = (typeof EQUIPMENT_FAMILY_PATHS)[number]

export const equipmentFamilyPathSchema = z.enum(EQUIPMENT_FAMILY_PATHS)

const KIND_TO_FAMILY: Record<EquipmentKind, EquipmentFamilyPath> = {
  weapon: 'weapons',
  armor: 'armor',
  adventuring_gear: 'adventuring-gear',
  tool: 'tools',
  mount: 'mounts',
  vehicle: 'vehicles',
  service: 'services',
  magic_item: 'magic-items',
}

const FAMILY_TO_KIND = Object.fromEntries(
  Object.entries(KIND_TO_FAMILY).map(([kind, path]) => [path, kind]),
) as Record<EquipmentFamilyPath, EquipmentKind>

export function equipmentKindToFamilyPath(kind: EquipmentKind): EquipmentFamilyPath {
  return KIND_TO_FAMILY[kind]
}

export function familyPathToEquipmentKind(path: string): EquipmentKind | undefined {
  return FAMILY_TO_KIND[path as EquipmentFamilyPath]
}

export function isEquipmentFamilyPath(path: string): path is EquipmentFamilyPath {
  return (EQUIPMENT_FAMILY_PATHS as readonly string[]).includes(path)
}

export function getEquipmentFamilyLabel(path: EquipmentFamilyPath): string {
  const kind = FAMILY_TO_KIND[path]
  return EQUIPMENT_KIND_LABELS[kind]
}
