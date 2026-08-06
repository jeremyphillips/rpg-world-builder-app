import { describe, expect, it } from 'vitest'

import type { Location, LocationConnectedPartyRow } from '@rpg/contracts'

import {
  assertRelationshipAlternativesMatchCapabilities,
  isRelationshipMutationActionAvailable,
  resolveRelationshipAlternatives,
} from './relationship-alternatives'
import {
  buildRelationshipOverflowActions,
  isRelationshipMutationOverflowActionId,
  type RelationshipOverflowActionId,
} from './resolve-relationship-overflow-actions'

function regionLocation(overrides: Partial<Location> = {}): Location {
  return {
    id: 'region-1',
    campaignId: 'camp-1',
    name: 'Lankhmar',
    slug: 'lankhmar',
    kind: 'region',
    ...overrides,
  } as Location
}

function buildingLocation(overrides: Partial<Location> = {}): Location {
  return {
    id: 'building-1',
    campaignId: 'camp-1',
    name: 'Guildhall',
    slug: 'guildhall',
    kind: 'structure',
    ...overrides,
  } as Location
}

describe('resolveRelationshipAlternatives', () => {
  it('marks single-kind geographic_presence changeKind unavailable while changeTarget can remain available', () => {
    const lankhmar = regionLocation()
    const otherRegion = regionLocation({ id: 'region-2', name: 'Neuromancer', slug: 'neuromancer' })

    const resolved = resolveRelationshipAlternatives({
      surface: 'organization_forward',
      canManage: true,
      occupancyLoaded: true,
      relationship: {
        connectionId: 'conn-1',
        locationId: lankhmar.id,
        kind: 'operates_in',
        subjectOrganizationId: 'org-1',
      },
      locations: [lankhmar, otherRegion],
      connections: [{ id: 'conn-1', locationId: lankhmar.id, kind: 'operates_in' }],
    })

    expect(resolved.capabilities.changeKind).toEqual({
      supported: true,
      availability: 'unavailable',
    })
    expect(resolved.capabilities.changeTarget).toEqual({
      supported: true,
      availability: 'available',
    })
    expect(resolved.alternatives.changeKind).toBeUndefined()
    expect(resolved.alternatives.changeTarget?.map((location) => location.id)).toEqual(['region-2'])
  })

  it('exposes changeKind when multi-kind site alternatives exist at the location', () => {
    const guildhall = buildingLocation()

    const resolved = resolveRelationshipAlternatives({
      surface: 'organization_forward',
      canManage: true,
      occupancyLoaded: true,
      relationship: {
        connectionId: 'conn-hq',
        locationId: guildhall.id,
        kind: 'headquarters',
        subjectOrganizationId: 'org-1',
      },
      locations: [guildhall],
      connections: [{ id: 'conn-hq', locationId: guildhall.id, kind: 'headquarters' }],
    })

    expect(resolved.capabilities.changeKind?.availability).toBe('available')
    expect(resolved.alternatives.changeKind?.length).toBeGreaterThan(0)
  })

  it('hides changeKind when location profile allows only the current kind', () => {
    const district = {
      ...regionLocation(),
      id: 'district-1',
      kind: 'district' as const,
      name: 'Dockside',
      slug: 'dockside',
    } as Location

    const resolved = resolveRelationshipAlternatives({
      surface: 'organization_forward',
      canManage: true,
      occupancyLoaded: true,
      relationship: {
        connectionId: 'conn-1',
        locationId: district.id,
        kind: 'operates_in',
        subjectOrganizationId: 'org-1',
      },
      locations: [district],
      connections: [{ id: 'conn-1', locationId: district.id, kind: 'operates_in' }],
    })

    expect(resolved.capabilities.changeKind?.availability).toBe('unavailable')
    expect(resolved.capabilities.changeTarget?.availability).toBe('unavailable')
  })

  it('returns unknown availability for singleton kinds while occupancy is loading', () => {
    const kingdom = regionLocation()

    const resolved = resolveRelationshipAlternatives({
      surface: 'organization_forward',
      canManage: true,
      occupancyLoaded: false,
      relationship: {
        connectionId: 'conn-governs',
        locationId: kingdom.id,
        kind: 'governs',
        subjectOrganizationId: 'org-1',
      },
      locations: [kingdom],
      connections: [{ id: 'conn-governs', locationId: kingdom.id, kind: 'governs' }],
    })

    expect(resolved.capabilities.changeTarget?.availability).toBe('unknown')
  })

  it('supports server availability snapshots without catalog scans', () => {
    const resolved = resolveRelationshipAlternatives({
      surface: 'organization_forward',
      canManage: true,
      relationship: {
        connectionId: 'conn-1',
        locationId: 'region-1',
        kind: 'operates_in',
        subjectOrganizationId: 'org-1',
      },
      availabilitySnapshot: {
        alternateKinds: ['operates_in'],
        alternateTargets: [{ id: 'region-2' }],
      },
      locations: [
        regionLocation(),
        regionLocation({ id: 'region-2', name: 'Other', slug: 'other' }),
      ],
    })

    expect(resolved.capabilities.changeTarget?.availability).toBe('available')
    expect(resolved.alternatives.changeTarget).toHaveLength(1)
  })

  it('finds replaceSubject alternatives for territorial inverse rows', () => {
    const kingdom = regionLocation()
    const rows: LocationConnectedPartyRow[] = [
      {
        relationshipId: 'rel-1',
        sectionGroup: 'territorial_authority',
        kind: 'governs',
        label: 'Governs',
        family: 'territorial_authority',
        priority: 50,
        subject: { id: 'org-1', type: 'organization', name: 'The Monarchy', slug: 'monarchy' },
      },
    ]

    const resolved = resolveRelationshipAlternatives({
      surface: 'location_inverse_organization',
      canManage: true,
      canEditRow: true,
      relationship: {
        relationshipId: 'rel-1',
        locationId: kingdom.id,
        kind: 'governs',
        subjectOrganizationId: 'org-1',
        allowReplaceSubject: true,
      },
      location: kingdom,
      rows,
      organizations: [
        { id: 'org-1', name: 'The Monarchy' },
        { id: 'org-2', name: 'Merchant League' },
      ],
    })

    expect(resolved.capabilities.replaceSubject?.availability).toBe('available')
    expect(resolved.alternatives.replaceSubject?.map((subject) => subject.id)).toEqual(['org-2'])
  })
})

describe('buildRelationshipOverflowActions', () => {
  it('omits mutations while availability is unknown', () => {
    const actions = buildRelationshipOverflowActions({
      capabilities: {
        view: { supported: true, availability: 'available' },
        changeKind: { supported: true, availability: 'unknown' },
        remove: { supported: true, availability: 'available' },
      },
      labels: { view: 'View', changeKind: 'Change type', remove: 'Remove' },
      handlers: {
        view: () => undefined,
        changeKind: () => undefined,
        remove: () => undefined,
      },
    })

    expect(actions.map((action) => action.id)).toEqual(['view', 'remove'])
  })
})

describe('architectural invariant: overflow mutations require alternatives', () => {
  const fixtures = [
    {
      name: 'geographic_presence forward',
      input: {
        surface: 'organization_forward' as const,
        canManage: true,
        occupancyLoaded: true,
        relationship: {
          connectionId: 'conn-1',
          locationId: 'region-1',
          kind: 'operates_in' as const,
          subjectOrganizationId: 'org-1',
        },
        locations: [
          regionLocation(),
          regionLocation({ id: 'region-2', name: 'Other Region', slug: 'other-region' }),
        ],
        connections: [{ id: 'conn-1', locationId: 'region-1', kind: 'operates_in' as const }],
      },
      labels: {
        view: 'View location',
        changeTarget: 'Change location',
        remove: 'Remove geographic presence',
      },
    },
    {
      name: 'site forward with kind alternatives',
      input: {
        surface: 'organization_forward' as const,
        canManage: true,
        occupancyLoaded: true,
        relationship: {
          connectionId: 'conn-hq',
          locationId: 'building-1',
          kind: 'headquarters' as const,
          subjectOrganizationId: 'org-1',
        },
        locations: [buildingLocation()],
        connections: [{ id: 'conn-hq', locationId: 'building-1', kind: 'headquarters' as const }],
      },
      labels: {
        view: 'View location',
        changeKind: 'Change relationship type',
        remove: 'Remove relationship',
      },
    },
  ]

  it.each(fixtures)(
    'every emitted mutation action has alternatives ($name)',
    ({ input, labels }) => {
      const resolved = resolveRelationshipAlternatives(input)
      const handlers = {
        view: () => undefined,
        changeKind: () => undefined,
        changeTarget: () => undefined,
        replaceSubject: () => undefined,
        remove: () => undefined,
      }

      const actions = buildRelationshipOverflowActions({
        capabilities: resolved.capabilities,
        labels,
        handlers,
      })

      assertRelationshipAlternativesMatchCapabilities(resolved.capabilities, resolved.alternatives)

      for (const action of actions) {
        if (!isRelationshipMutationOverflowActionId(action.id as RelationshipOverflowActionId)) {
          continue
        }
        const mutationActionId = action.id as RelationshipOverflowActionId
        if (
          mutationActionId !== 'changeKind' &&
          mutationActionId !== 'changeTarget' &&
          mutationActionId !== 'replaceSubject'
        ) {
          continue
        }

        expect(isRelationshipMutationActionAvailable(resolved.capabilities, mutationActionId)).toBe(
          true,
        )

        if (mutationActionId === 'changeKind') {
          expect(resolved.alternatives.changeKind?.length).toBeGreaterThan(0)
        }
        if (mutationActionId === 'changeTarget') {
          expect(resolved.alternatives.changeTarget?.length).toBeGreaterThan(0)
        }
        if (mutationActionId === 'replaceSubject') {
          expect(resolved.alternatives.replaceSubject?.length).toBeGreaterThan(0)
        }
      }
    },
  )
})
