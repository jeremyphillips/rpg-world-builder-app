import { describe, expect, it } from 'vitest'

import {
  LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES,
  buildLocationHierarchyGraphFromNodes,
  inferLocationParentAssignmentBlockerFromMessage,
  validateLocationParentAssignment,
  type LocationHierarchyNode,
} from './validate-location-parent-assignment'

function graph(nodes: LocationHierarchyNode[]) {
  return buildLocationHierarchyGraphFromNodes(nodes)
}

describe('validateLocationParentAssignment', () => {
  const world: LocationHierarchyNode = { id: 'world-1', kind: 'world' }
  const region: LocationHierarchyNode = {
    id: 'region-1',
    kind: 'region',
    parentLocationId: 'world-1',
  }
  const settlement: LocationHierarchyNode = {
    id: 'settlement-1',
    kind: 'settlement',
    parentLocationId: 'region-1',
  }
  const district: LocationHierarchyNode = {
    id: 'district-1',
    kind: 'district',
    parentLocationId: 'settlement-1',
  }

  it('returns no blockers when assigning a valid parent', () => {
    expect(
      validateLocationParentAssignment({
        locationId: 'settlement-1',
        locationKind: 'settlement',
        proposedParentId: 'world-1',
        locationsById: graph([world, region, settlement]),
      }),
    ).toEqual([])
  })

  it('returns parent_forbidden before other checks', () => {
    expect(
      validateLocationParentAssignment({
        locationId: 'plane-1',
        locationKind: 'plane',
        proposedParentId: 'world-1',
        locationsById: graph([world, { id: 'plane-1', kind: 'plane' }]),
      }),
    ).toEqual([
      expect.objectContaining({
        code: LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.parent_forbidden,
      }),
    ])
  })

  it('returns parent_required when clearing a kind that requires a parent', () => {
    expect(
      validateLocationParentAssignment({
        locationId: 'region-1',
        locationKind: 'region',
        proposedParentId: null,
        locationsById: graph([world, region]),
      }),
    ).toEqual([
      expect.objectContaining({
        code: LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.parent_required,
      }),
    ])
  })

  it('returns self_parent when proposed parent is the location itself', () => {
    expect(
      validateLocationParentAssignment({
        locationId: 'world-1',
        locationKind: 'world',
        proposedParentId: 'world-1',
        locationsById: graph([world]),
      }),
    ).toEqual([
      expect.objectContaining({
        code: LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.self_parent,
        message: 'A location cannot be its own parent.',
      }),
    ])
  })

  it('returns parent_not_found when proposed parent is absent from the graph', () => {
    expect(
      validateLocationParentAssignment({
        locationId: 'region-1',
        locationKind: 'region',
        proposedParentId: 'missing-parent',
        locationsById: graph([world, region]),
      }),
    ).toEqual([
      expect.objectContaining({
        code: LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.parent_not_found,
      }),
    ])
  })

  it('returns descendant_parent when moving under a direct child', () => {
    expect(
      validateLocationParentAssignment({
        locationId: 'region-1',
        locationKind: 'region',
        proposedParentId: 'settlement-1',
        locationsById: graph([world, region, settlement]),
      }),
    ).toEqual([
      expect.objectContaining({
        code: LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.descendant_parent,
        message: 'A location cannot be moved under one of its descendants.',
      }),
    ])
  })

  it('returns invalid_parent_kind for incompatible parent kinds', () => {
    expect(
      validateLocationParentAssignment({
        locationId: 'structure-1',
        locationKind: 'structure',
        proposedParentId: 'region-1',
        locationsById: graph([world, region, { id: 'structure-1', kind: 'structure' }]),
      }),
    ).toEqual([
      expect.objectContaining({
        code: LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.invalid_parent_kind,
      }),
    ])
  })

  it('returns invalid_parent_kind when a district is placed under another district', () => {
    const innerDistrict: LocationHierarchyNode = {
      id: 'district-inner',
      kind: 'district',
      parentLocationId: 'district-1',
    }

    expect(
      validateLocationParentAssignment({
        locationId: 'district-inner',
        locationKind: 'district',
        proposedParentId: 'district-1',
        locationsById: graph([world, region, settlement, district, innerDistrict]),
      }),
    ).toEqual([
      expect.objectContaining({
        code: LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.invalid_parent_kind,
      }),
    ])
  })

  it('returns descendant_parent for reassignment under an indirect descendant', () => {
    expect(
      validateLocationParentAssignment({
        locationId: 'world-1',
        locationKind: 'world',
        proposedParentId: 'district-1',
        locationsById: graph([world, region, settlement, district]),
      }),
    ).toEqual([
      expect.objectContaining({
        code: LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.descendant_parent,
        message: 'A location cannot be moved under one of its descendants.',
      }),
    ])
  })

  it('prefers descendant_parent over cycle when both would apply to a direct child', () => {
    expect(
      validateLocationParentAssignment({
        locationId: 'world-1',
        locationKind: 'world',
        proposedParentId: 'region-1',
        locationsById: graph([world, region]),
      }),
    ).toEqual([
      expect.objectContaining({
        code: LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.descendant_parent,
      }),
    ])
  })

  it('allows clearing parent for optional-parent kinds', () => {
    expect(
      validateLocationParentAssignment({
        locationId: 'world-1',
        locationKind: 'world',
        proposedParentId: null,
        locationsById: graph([world]),
      }),
    ).toEqual([])
  })
})

describe('buildLocationHierarchyGraphFromNodes', () => {
  it('indexes nodes by id', () => {
    const nodes = [
      { id: 'a', kind: 'world' as const },
      { id: 'b', kind: 'region' as const, parentLocationId: 'a' },
    ]
    const locationsById = graph(nodes)

    expect(locationsById.get('a')).toEqual(nodes[0])
    expect(locationsById.get('b')).toEqual(nodes[1])
  })
})

describe('inferLocationParentAssignmentBlockerFromMessage', () => {
  it('reverse-maps canonical validator messages', () => {
    expect(
      inferLocationParentAssignmentBlockerFromMessage(
        'A location cannot be moved under one of its descendants.',
      ).code,
    ).toBe(LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.descendant_parent)

    expect(
      inferLocationParentAssignmentBlockerFromMessage(
        'A Settlement cannot be placed under a Region.',
      ).code,
    ).toBe(LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.invalid_parent_kind)
  })

  it('falls back to hierarchy_violation for unknown messages', () => {
    expect(inferLocationParentAssignmentBlockerFromMessage('Something unexpected.').code).toBe(
      LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.hierarchy_violation,
    )
  })
})
