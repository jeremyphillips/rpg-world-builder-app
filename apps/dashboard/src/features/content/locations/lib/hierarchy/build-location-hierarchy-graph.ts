import {
  buildLocationHierarchyGraphFromNodes,
  type Location,
  type LocationHierarchyNode,
} from '@rpg/contracts'

/**
 * Builds an id-indexed hierarchy graph from campaign locations.
 *
 * Input must be the full manager-visible campaign location list (unpaginated,
 * not table-filtered). Overview `data` from `useLocations` satisfies this today.
 */
export function buildLocationHierarchyGraph(
  locations: readonly Location[],
): ReadonlyMap<string, LocationHierarchyNode> {
  const nodes: LocationHierarchyNode[] = locations.map((location) => ({
    id: location.id,
    kind: location.kind,
    parentLocationId: location.parentLocationId,
  }))

  return buildLocationHierarchyGraphFromNodes(nodes)
}
