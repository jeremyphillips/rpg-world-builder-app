import { describe, expect, it } from 'vitest'

import {
  buildLocationHierarchyGraphFromNodes,
  type LocationHierarchyNode,
} from './validate-location-parent-assignment'
import {
  findNearestSettlementAncestorId,
  isDistrictUnderDistrict,
  planDistrictUnderDistrictRepair,
} from './repair-district-nesting'

function graph(nodes: LocationHierarchyNode[]) {
  return buildLocationHierarchyGraphFromNodes(nodes)
}

describe('district nesting repair', () => {
  const settlement: LocationHierarchyNode = { id: 'city', kind: 'settlement' }
  const park: LocationHierarchyNode = {
    id: 'park',
    kind: 'district',
    parentLocationId: 'city',
  }
  const tenderloin: LocationHierarchyNode = {
    id: 'tenderloin',
    kind: 'district',
    parentLocationId: 'park',
  }

  it('detects district-under-district nests', () => {
    const locationsById = graph([settlement, park, tenderloin])

    expect(isDistrictUnderDistrict(park, locationsById)).toBe(false)
    expect(isDistrictUnderDistrict(tenderloin, locationsById)).toBe(true)
  })

  it('finds the nearest settlement ancestor', () => {
    const locationsById = graph([settlement, park, tenderloin])

    expect(findNearestSettlementAncestorId('park', locationsById)).toBe('city')
    expect(findNearestSettlementAncestorId('tenderloin', locationsById)).toBe('city')
  })

  it('plans repair to the nearest settlement ancestor', () => {
    const locationsById = graph([settlement, park, tenderloin])

    expect(planDistrictUnderDistrictRepair(tenderloin, locationsById)).toEqual({
      status: 'repair',
      districtId: 'tenderloin',
      repairedParentId: 'city',
    })
    expect(planDistrictUnderDistrictRepair(park, locationsById)).toEqual({ status: 'valid' })
  })

  it('flags districts with no settlement ancestor as unrepairable', () => {
    const orphanDistrict: LocationHierarchyNode = {
      id: 'orphan',
      kind: 'district',
      parentLocationId: 'missing-parent',
    }
    const nestedOrphan: LocationHierarchyNode = {
      id: 'nested',
      kind: 'district',
      parentLocationId: 'orphan',
    }
    const locationsById = graph([orphanDistrict, nestedOrphan])

    expect(planDistrictUnderDistrictRepair(nestedOrphan, locationsById)).toEqual({
      status: 'unrepairable',
      districtId: 'nested',
      reason: 'no_settlement_ancestor',
    })
  })
})
