import type { LocationHierarchyNode } from './validate-location-parent-assignment'

/** Returns whether a district is nested directly under another district. */
export function isDistrictUnderDistrict(
  location: Pick<LocationHierarchyNode, 'kind' | 'parentLocationId'>,
  locationsById: ReadonlyMap<string, LocationHierarchyNode>,
): boolean {
  if (location.kind !== 'district' || !location.parentLocationId) {
    return false
  }

  const parent = locationsById.get(location.parentLocationId)
  return parent?.kind === 'district'
}

/** Walks ancestors from `startLocationId` until the nearest settlement is found. */
export function findNearestSettlementAncestorId(
  startLocationId: string,
  locationsById: ReadonlyMap<string, LocationHierarchyNode>,
): string | undefined {
  const visited = new Set<string>()
  let currentId: string | undefined = startLocationId

  while (currentId) {
    if (visited.has(currentId)) {
      return undefined
    }
    visited.add(currentId)

    const current = locationsById.get(currentId)
    if (!current) {
      return undefined
    }

    if (current.kind === 'settlement') {
      return currentId
    }

    currentId = current.parentLocationId
  }

  return undefined
}

export type DistrictUnderDistrictRepairPlan =
  | { status: 'valid' }
  | { status: 'repair'; districtId: string; repairedParentId: string }
  | { status: 'unrepairable'; districtId: string; reason: 'no_settlement_ancestor' }

/** Plans reparenting invalid district nests to the nearest settlement ancestor. */
export function planDistrictUnderDistrictRepair(
  location: LocationHierarchyNode,
  locationsById: ReadonlyMap<string, LocationHierarchyNode>,
): DistrictUnderDistrictRepairPlan {
  if (!isDistrictUnderDistrict(location, locationsById)) {
    return { status: 'valid' }
  }

  const repairedParentId = findNearestSettlementAncestorId(
    location.parentLocationId!,
    locationsById,
  )
  if (!repairedParentId) {
    return { status: 'unrepairable', districtId: location.id, reason: 'no_settlement_ancestor' }
  }

  return { status: 'repair', districtId: location.id, repairedParentId }
}
