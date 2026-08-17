import { describe, expect, it } from 'vitest'

import type { LocationConnectedPartyRow, OrganizationLocationConnectionKind } from '@rpg/contracts'

import {
  testBuildingLocation,
  testRegionLocation,
  testSettlementLocation,
  testStructureLocation,
} from '@/features/content/lib/fixtures/location-test-helpers'
import {
  filterOrganizationKindsByFamily,
  filterLocationsForOrganizationKind,
  organizationDrawerIntentFromKind,
  organizationForwardKindHasAvailableLocation,
  organizationForwardLocationHasAvailableKind,
  organizationInverseSubjectHasAvailableKind,
  resolveKindsForOrganizationDrawerIntent,
  resolveLocationInverseOrganizationAddAffordances,
  resolveOrganizationKindsForDrawerIntent,
  resolvePeopleSectionOrganizationAddAffordances,
  resolveTerritorialSectionOrganizationAddAffordances,
  resolveVisibleOrganizationConnectionFamilies,
} from './location-connection-drawer-intent'

function territorialRow(input: {
  relationshipId: string
  organizationId: string
  kind: Extract<OrganizationLocationConnectionKind, 'governs' | 'controls' | 'claims'>
}): LocationConnectedPartyRow {
  return {
    relationshipId: input.relationshipId,
    subjectType: 'organization',
    subject: {
      type: 'organization',
      id: input.organizationId,
      name: input.organizationId,
      slug: input.organizationId,
    },
    kind: input.kind,
    label: input.kind,
    family: 'territorial_authority',
    priority: 50,
    sectionGroup: 'territorial_authority',
  }
}

describe('location-connection-drawer-intent', () => {
  it('maps connection kinds to drawer intents via family', () => {
    expect(organizationDrawerIntentFromKind('governs')).toBe('territorial_authority')
    expect(organizationDrawerIntentFromKind('operates_in')).toBe('geographic_presence')
    expect(organizationDrawerIntentFromKind('headquarters')).toBe('site')
  })

  it('filters organization kinds by family for a region', () => {
    const kinds = resolveOrganizationKindsForDrawerIntent(
      testRegionLocation(),
      'territorial_authority',
    )
    expect(kinds).toEqual(['governs', 'controls', 'claims'])

    const presenceKinds = resolveOrganizationKindsForDrawerIntent(
      testRegionLocation(),
      'geographic_presence',
    )
    expect(presenceKinds).toEqual(['operates_in'])
  })

  it('exposes region territorial and presence add affordances separately', () => {
    const regionAffordances = resolveLocationInverseOrganizationAddAffordances(testRegionLocation())
    expect(regionAffordances.map((affordance) => affordance.label)).toEqual([
      'Add authority',
      'Add organization presence',
    ])

    expect(resolveTerritorialSectionOrganizationAddAffordances(testRegionLocation())).toEqual([
      { intent: 'territorial_authority', label: 'Add authority' },
    ])
    expect(resolvePeopleSectionOrganizationAddAffordances(testRegionLocation())).toEqual([
      { intent: 'geographic_presence', label: 'Add organization presence' },
    ])
  })

  it('exposes settlement governing org and presence affordances without site family add', () => {
    const settlementAffordances =
      resolveLocationInverseOrganizationAddAffordances(testSettlementLocation())
    expect(settlementAffordances.map((affordance) => affordance.label)).toEqual([
      'Add governing organization',
      'Add organization presence',
    ])
  })

  it('derives change-target eligibility from the persisted kind, not drawer-intent kind union', () => {
    const settlement = testSettlementLocation()
    const guildhall = testBuildingLocation({ name: 'Guildhall', slug: 'guildhall' })
    const mint = testBuildingLocation({
      id: 'building-2',
      name: 'Silver Eel',
      slug: 'silver-eel',
    })

    const headquartersTargets = filterLocationsForOrganizationKind(
      [settlement, guildhall, mint],
      'headquarters',
      'org-1',
      [],
      {},
    )

    expect(headquartersTargets.map((location) => location.id)).toEqual(['building-1', 'building-2'])
  })

  it('keeps territorial add available when only governs slot is occupied by another org', () => {
    const location = testRegionLocation()
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
    const location = testRegionLocation()
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
    const location = testStructureLocation({ id: 'building-1' })
    const connections = [{ id: 'conn-1', locationId: location.id, kind: 'owns' as const }]

    expect(
      organizationForwardLocationHasAvailableKind(location, 'site', 'org-1', connections),
    ).toBe(true)
  })

  it('allows kind changes within territorial authority during edit', () => {
    const location = testRegionLocation()
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
      territorialRow({ relationshipId: 'rel-other', organizationId: 'org-other', kind: 'governs' }),
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
      territorialRow({ relationshipId: 'rel-1', organizationId: 'org-1', kind: 'governs' }),
    ]

    expect(
      organizationInverseSubjectHasAvailableKind('org-1', 'region-1', eligibleKinds, rows, 'rel-1'),
    ).toBe(true)
  })

  it('resolves all kinds for a drawer intent from contracts vocabulary', () => {
    expect(resolveKindsForOrganizationDrawerIntent('site')).toEqual([
      'headquarters',
      'owns',
      'tenant',
      'operator',
    ])
  })

  it('filters locations by selected kind using server-backed occupancy', () => {
    const region = testRegionLocation()
    const building = testStructureLocation({ id: 'building-1' })

    const governsBlocked = filterLocationsForOrganizationKind([region], 'governs', 'org-1', [], {
      [region.id]: [
        {
          organizationId: 'org-other',
          connectionId: 'conn-other',
          locationId: region.id,
          kind: 'governs',
        },
      ],
    })
    expect(governsBlocked).toEqual([])

    const ownsEligible = filterLocationsForOrganizationKind([building], 'owns', 'org-1', [], {})
    expect(ownsEligible.map((location) => location.id)).toEqual(['building-1'])
  })

  it('does not treat org-local connections as authoritative for cross-org governs occupancy', () => {
    const region = testRegionLocation()
    expect(organizationForwardKindHasAvailableLocation('governs', [region], 'org-1', [], {})).toBe(
      true,
    )

    expect(
      organizationForwardKindHasAvailableLocation(
        'governs',
        [region],
        'org-1',
        [],
        {
          [region.id]: [
            {
              organizationId: 'org-other',
              connectionId: 'conn-other',
              locationId: region.id,
              kind: 'governs',
            },
          ],
        },
        undefined,
        true,
      ),
    ).toBe(false)
  })

  it('derives visible forward families from location profiles', () => {
    expect(
      resolveVisibleOrganizationConnectionFamilies([testRegionLocation(), testBuildingLocation()]),
    ).toEqual(['territorial_authority', 'geographic_presence', 'site'])
  })
})
