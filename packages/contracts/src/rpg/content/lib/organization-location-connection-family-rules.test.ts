import { describe, expect, it } from 'vitest'

import {
  organizationLocationConnectionHasAvailableKindInFamily,
  organizationLocationConnectionKindBlockedForLocation,
  organizationLocationConnectionKindBlockedForOrganizationAtLocation,
  organizationLocationConnectionKindSlotOccupiedAtLocation,
} from './organization-location-connection-family-rules'

describe('organization location connection family rules', () => {
  it('allows multiple site kinds on the same location', () => {
    const connections = [
      { id: 'conn-1', locationId: 'loc-1', kind: 'owns' as const },
      { id: 'conn-2', locationId: 'loc-1', kind: 'headquarters' as const },
    ]

    expect(
      organizationLocationConnectionKindBlockedForOrganizationAtLocation({
        locationId: 'loc-1',
        kind: 'operator',
        connections,
      }),
    ).toBe(false)
    expect(
      organizationLocationConnectionHasAvailableKindInFamily({
        locationId: 'loc-1',
        kinds: ['owns', 'headquarters', 'operator'],
        subjectOrganizationId: 'org-1',
        connections,
      }),
    ).toBe(true)
  })

  it('allows governs and controls for the same organization at one location', () => {
    const connections = [{ id: 'conn-1', locationId: 'loc-1', kind: 'governs' as const }]

    expect(
      organizationLocationConnectionKindBlockedForOrganizationAtLocation({
        locationId: 'loc-1',
        kind: 'controls',
        connections,
      }),
    ).toBe(false)
    expect(
      organizationLocationConnectionHasAvailableKindInFamily({
        locationId: 'loc-1',
        kinds: ['governs', 'controls', 'claims'],
        subjectOrganizationId: 'org-1',
        connections,
      }),
    ).toBe(true)
  })

  it('blocks cross-org singleton governs when another organization occupies the slot', () => {
    const connections = [{ id: 'conn-2', locationId: 'loc-1', kind: 'claims' as const }]
    const edgesAtLocation = [
      {
        organizationId: 'org-a',
        connectionId: 'conn-1',
        locationId: 'loc-1',
        kind: 'governs' as const,
      },
    ]

    expect(
      organizationLocationConnectionKindBlockedForLocation({
        locationId: 'loc-1',
        kind: 'governs',
        subjectOrganizationId: 'org-b',
        connections,
        edgesAtLocation,
      }),
    ).toBe(true)
    expect(
      organizationLocationConnectionKindSlotOccupiedAtLocation({
        locationId: 'loc-1',
        kind: 'governs',
        edgesAtLocation,
      }),
    ).toBe(true)
  })

  it('allows kind changes when excluding the current connection from occupancy checks', () => {
    const connections = [{ id: 'conn-1', locationId: 'loc-1', kind: 'governs' as const }]
    const edgesAtLocation = [
      {
        organizationId: 'org-1',
        connectionId: 'conn-1',
        locationId: 'loc-1',
        kind: 'governs' as const,
      },
    ]

    expect(
      organizationLocationConnectionKindBlockedForLocation({
        locationId: 'loc-1',
        kind: 'controls',
        subjectOrganizationId: 'org-1',
        connections,
        edgesAtLocation,
        excludeConnectionId: 'conn-1',
      }),
    ).toBe(false)
  })

  it('rejects duplicate geographic presence on the same location', () => {
    const connections = [{ id: 'conn-1', locationId: 'loc-1', kind: 'operates_in' as const }]

    expect(
      organizationLocationConnectionKindBlockedForOrganizationAtLocation({
        locationId: 'loc-1',
        kind: 'operates_in',
        connections,
      }),
    ).toBe(true)
  })

  it('allows multiple claims from different organizations at the same location', () => {
    const connections = [{ id: 'conn-2', locationId: 'loc-1', kind: 'claims' as const }]
    const edgesAtLocation = [
      {
        organizationId: 'org-a',
        connectionId: 'conn-1',
        locationId: 'loc-1',
        kind: 'claims' as const,
      },
    ]

    expect(
      organizationLocationConnectionKindBlockedForLocation({
        locationId: 'loc-1',
        kind: 'claims',
        subjectOrganizationId: 'org-b',
        connections,
        edgesAtLocation,
      }),
    ).toBe(false)
  })

  it('allows territorial authority alongside geographic presence on the same location', () => {
    const connections = [{ id: 'conn-1', locationId: 'loc-1', kind: 'operates_in' as const }]

    expect(
      organizationLocationConnectionKindBlockedForOrganizationAtLocation({
        locationId: 'loc-1',
        kind: 'governs',
        connections,
      }),
    ).toBe(false)
  })
})
