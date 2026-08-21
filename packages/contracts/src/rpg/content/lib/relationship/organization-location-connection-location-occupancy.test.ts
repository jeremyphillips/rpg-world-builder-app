import { describe, expect, it } from 'vitest'

import {
  organizationLocationConnectionLocationOccupancyViolationMessage,
  organizationLocationConnectionLocationSubjectBlocked,
  resolveOrganizationLocationConnectionLocationOccupant,
} from './organization-location-connection-location-occupancy'

describe('organization location connection location occupancy', () => {
  const edgesAtLocation = [
    {
      organizationId: 'org-a',
      connectionId: 'conn-1',
      locationId: 'loc-1',
      kind: 'governs' as const,
      subjectName: 'The Monarchy',
    },
  ]

  it('blocks a second organization from occupying a singleton governs slot', () => {
    expect(
      organizationLocationConnectionLocationSubjectBlocked({
        locationId: 'loc-1',
        kind: 'governs',
        subjectOrganizationId: 'org-b',
        edgesAtLocation,
      }),
    ).toBe(true)
  })

  it('allows the occupying organization to retain the slot during edit', () => {
    expect(
      organizationLocationConnectionLocationSubjectBlocked({
        locationId: 'loc-1',
        kind: 'governs',
        subjectOrganizationId: 'org-a',
        edgesAtLocation,
        excludeConnectionId: 'conn-1',
      }),
    ).toBe(false)
  })

  it('resolves the current occupant for singleton slots', () => {
    expect(
      resolveOrganizationLocationConnectionLocationOccupant({
        locationId: 'loc-1',
        kind: 'governs',
        edgesAtLocation,
      }),
    ).toEqual(edgesAtLocation[0])
  })

  it('formats occupancy violation messages with the occupant name', () => {
    expect(
      organizationLocationConnectionLocationOccupancyViolationMessage({
        kind: 'governs',
        occupantName: 'The Monarchy',
      }),
    ).toBe('The Monarchy already governs this location.')
  })
})
