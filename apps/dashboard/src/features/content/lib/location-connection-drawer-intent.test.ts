import { describe, expect, it } from 'vitest'

import type { Location } from '@rpg/contracts'

import {
  filterOrganizationKindsByFamily,
  organizationDrawerIntentFromKind,
  organizationForwardLocationHasAvailableKind,
  organizationInverseSubjectHasAvailableKind,
  resolveLocationInverseOrganizationAddAffordances,
  resolveOrganizationKindsForDrawerIntent,
  resolvePeopleSectionOrganizationAddAffordances,
  resolveTerritorialSectionOrganizationAddAffordances,
} from './location-connection-drawer-intent'

function regionLocation(overrides: Partial<Location> = {}): Location {
  return {
    id: 'region-1',
    campaignId: 'camp-1',
    name: 'Kingdom of Foo',
    slug: 'kingdom-of-foo',
    kind: 'region',
    ...overrides,
  } as Location
}

function settlementLocation(overrides: Partial<Location> = {}): Location {
  return {
    id: 'settlement-1',
    campaignId: 'camp-1',
    name: 'Port City',
    slug: 'port-city',
    kind: 'settlement',
    ...overrides,
  } as Location
}

describe('location-connection-drawer-intent', () => {
  it('maps connection kinds to drawer intents via family', () => {
    expect(organizationDrawerIntentFromKind('governs')).toBe('territorial_authority')
    expect(organizationDrawerIntentFromKind('operates_in')).toBe('geographic_presence')
    expect(organizationDrawerIntentFromKind('headquarters')).toBe('site')
  })

  it('filters organization kinds by family for a region', () => {
    const kinds = resolveOrganizationKindsForDrawerIntent(regionLocation(), 'territorial_authority')
    expect(kinds).toEqual(['governs', 'controls', 'claims'])

    const presenceKinds = resolveOrganizationKindsForDrawerIntent(
      regionLocation(),
      'geographic_presence',
    )
    expect(presenceKinds).toEqual(['operates_in'])
  })

  it('exposes region territorial and presence add affordances separately', () => {
    const regionAffordances = resolveLocationInverseOrganizationAddAffordances(regionLocation())
    expect(regionAffordances.map((affordance) => affordance.label)).toEqual([
      'Add authority',
      'Add organization presence',
    ])

    expect(resolveTerritorialSectionOrganizationAddAffordances(regionLocation())).toEqual([
      { intent: 'territorial_authority', label: 'Add authority' },
    ])
    expect(resolvePeopleSectionOrganizationAddAffordances(regionLocation())).toEqual([
      { intent: 'geographic_presence', label: 'Add organization presence' },
    ])
  })

  it('exposes settlement governing org, headquarters, and presence affordances', () => {
    const settlementAffordances =
      resolveLocationInverseOrganizationAddAffordances(settlementLocation())
    expect(settlementAffordances.map((affordance) => affordance.label)).toEqual([
      'Add governing organization',
      'Add headquarters',
      'Add organization presence',
    ])
  })

  it('keeps territorial add available when only governs slot is occupied by another org', () => {
    const location = regionLocation()
    const edgesAtLocation = [
      {
        organizationId: 'org-other',
        connectionId: 'conn-other',
        locationId: location.id,
        kind: 'governs' as const,
      },
    ]

    expect(
      organizationForwardLocationHasAvailableKind(
        location,
        'territorial_authority',
        'org-1',
        [],
        edgesAtLocation,
      ),
    ).toBe(true)
  })

  it('allows multiple territorial kinds for the same organization at one location', () => {
    const location = regionLocation()
    const connections = [{ id: 'conn-1', locationId: location.id, kind: 'governs' as const }]

    expect(
      organizationForwardLocationHasAvailableKind(
        location,
        'territorial_authority',
        'org-1',
        connections,
      ),
    ).toBe(true)
  })

  it('keeps forward location rows selectable when only some site kinds are linked', () => {
    const location = {
      ...settlementLocation(),
      id: 'building-1',
      kind: 'structure',
      structureType: 'building',
    } as Location
    const connections = [{ id: 'conn-1', locationId: location.id, kind: 'owns' as const }]

    expect(
      organizationForwardLocationHasAvailableKind(location, 'site', 'org-1', connections),
    ).toBe(true)
  })

  it('allows kind changes within territorial authority during edit', () => {
    const location = regionLocation()
    const connections = [{ id: 'conn-1', locationId: location.id, kind: 'governs' as const }]
    const edgesAtLocation = [
      {
        organizationId: 'org-1',
        connectionId: 'conn-1',
        locationId: location.id,
        kind: 'governs' as const,
      },
    ]

    expect(
      organizationForwardLocationHasAvailableKind(
        location,
        'territorial_authority',
        'org-1',
        connections,
        edgesAtLocation,
        'conn-1',
      ),
    ).toBe(true)
  })

  it('disables inverse organization rows when singleton slot is occupied by another org', () => {
    const rows = [
      {
        subject: { id: 'org-other', type: 'organization' as const },
        kind: 'governs' as const,
        relationshipId: 'rel-other',
      },
    ]

    expect(organizationInverseSubjectHasAvailableKind('org-1', 'region-1', ['governs'], rows)).toBe(
      false,
    )
    expect(
      organizationInverseSubjectHasAvailableKind('org-1', 'region-1', ['controls'], rows),
    ).toBe(true)
  })

  it('allows inverse kind changes within territorial authority during edit', () => {
    const eligibleKinds = filterOrganizationKindsByFamily(
      ['governs', 'controls', 'claims'],
      'territorial_authority',
    )
    const rows = [
      {
        subject: { id: 'org-1', type: 'organization' as const },
        kind: 'governs' as const,
        relationshipId: 'rel-1',
      },
    ]

    expect(
      organizationInverseSubjectHasAvailableKind('org-1', 'region-1', eligibleKinds, rows, 'rel-1'),
    ).toBe(true)
  })
})
