import { describe, expect, it } from 'vitest'

import {
  organizationLocationConnectionHasAvailableKindInFamily,
  organizationLocationConnectionKindBlockedForLocation,
} from './organization-location-connection-family-rules'

describe('organization location connection family rules', () => {
  it('allows multiple site kinds on the same location', () => {
    const connections = [
      { id: 'conn-1', locationId: 'loc-1', kind: 'owns' as const },
      { id: 'conn-2', locationId: 'loc-1', kind: 'headquarters' as const },
    ]

    expect(
      organizationLocationConnectionKindBlockedForLocation({
        locationId: 'loc-1',
        kind: 'operator',
        connections,
      }),
    ).toBe(false)
    expect(
      organizationLocationConnectionHasAvailableKindInFamily({
        locationId: 'loc-1',
        kinds: ['owns', 'headquarters', 'operator'],
        connections,
      }),
    ).toBe(true)
  })

  it('rejects a second territorial authority kind on the same location', () => {
    const connections = [{ id: 'conn-1', locationId: 'loc-1', kind: 'governs' as const }]

    expect(
      organizationLocationConnectionKindBlockedForLocation({
        locationId: 'loc-1',
        kind: 'controls',
        connections,
      }),
    ).toBe(true)
    expect(
      organizationLocationConnectionHasAvailableKindInFamily({
        locationId: 'loc-1',
        kinds: ['governs', 'controls', 'claims'],
        connections,
      }),
    ).toBe(false)
  })

  it('allows a single territorial row to change kind within the family', () => {
    const connections = [{ id: 'conn-1', locationId: 'loc-1', kind: 'governs' as const }]

    expect(
      organizationLocationConnectionKindBlockedForLocation({
        locationId: 'loc-1',
        kind: 'controls',
        connections,
        excludeConnectionId: 'conn-1',
      }),
    ).toBe(false)
    expect(
      organizationLocationConnectionHasAvailableKindInFamily({
        locationId: 'loc-1',
        kinds: ['governs', 'controls', 'claims'],
        connections,
        excludeConnectionId: 'conn-1',
      }),
    ).toBe(true)
  })

  it('rejects duplicate geographic presence on the same location', () => {
    const connections = [{ id: 'conn-1', locationId: 'loc-1', kind: 'operates_in' as const }]

    expect(
      organizationLocationConnectionKindBlockedForLocation({
        locationId: 'loc-1',
        kind: 'operates_in',
        connections,
      }),
    ).toBe(true)
  })

  it('allows territorial authority alongside geographic presence on the same location', () => {
    const connections = [{ id: 'conn-1', locationId: 'loc-1', kind: 'operates_in' as const }]

    expect(
      organizationLocationConnectionKindBlockedForLocation({
        locationId: 'loc-1',
        kind: 'governs',
        connections,
      }),
    ).toBe(false)
    expect(
      organizationLocationConnectionHasAvailableKindInFamily({
        locationId: 'loc-1',
        kinds: ['governs', 'controls', 'claims'],
        connections,
      }),
    ).toBe(true)
  })
})
