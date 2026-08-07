import { describe, expect, it } from 'vitest'

import { buildingClassificationSchema, type Location } from '@rpg/contracts'

import { resolveLocationInverseRelationshipDescription } from './location-inverse-relationship-description'

const baseLocation = {
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'homebrew' as const,
  status: 'published' as const,
  campaignId: 'camp_1',
  id: 'loc_test',
  slug: 'test',
  name: 'Test',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function buildingLocation(overrides: Partial<Location> = {}): Location {
  return {
    ...baseLocation,
    kind: 'structure',
    structureType: 'building',
    classification: buildingClassificationSchema.parse({ archetype: 'tavern' }),
    ...overrides,
  } as Location
}

describe('resolveLocationInverseRelationshipDescription', () => {
  it('describes owns at a building with the reference noun', () => {
    expect(
      resolveLocationInverseRelationshipDescription({
        kind: 'owns',
        location: buildingLocation(),
      }),
    ).toBe('Owns or holds title to this building.')
  })

  it('describes headquarters with primary headquarters copy', () => {
    expect(
      resolveLocationInverseRelationshipDescription({
        kind: 'headquarters',
        location: buildingLocation(),
      }),
    ).toBe('Uses this building as its primary headquarters.')
  })

  it('describes operator at fortification and vessel', () => {
    expect(
      resolveLocationInverseRelationshipDescription({
        kind: 'operator',
        location: {
          ...baseLocation,
          kind: 'structure',
          structureType: 'fortification',
        },
      }),
    ).toBe("Runs or manages this fortification's day-to-day operations.")

    expect(
      resolveLocationInverseRelationshipDescription({
        kind: 'operator',
        location: {
          ...baseLocation,
          kind: 'structure',
          structureType: 'vessel',
        },
      }),
    ).toBe("Runs or manages this vessel's day-to-day operations.")
  })

  it('describes tenant at typed interior with the interior type noun', () => {
    expect(
      resolveLocationInverseRelationshipDescription({
        kind: 'tenant',
        location: {
          ...baseLocation,
          kind: 'interior',
          interiorType: 'space',
          classification: { type: 'chamber' },
        },
      }),
    ).toBe('Occupies or leases this space without owning it.')
  })

  it('uses geographic residence copy for settlements and districts', () => {
    expect(
      resolveLocationInverseRelationshipDescription({
        kind: 'resides_at',
        location: {
          ...baseLocation,
          kind: 'settlement',
          settlementType: 'city',
          parentLocationId: 'loc_parent',
        },
      }),
    ).toBe('Lives in this settlement.')

    expect(
      resolveLocationInverseRelationshipDescription({
        kind: 'resides_at',
        location: {
          ...baseLocation,
          kind: 'district',
          parentLocationId: 'loc_parent',
        },
      }),
    ).toBe('Lives in this district.')
  })

  it('uses premises residence copy for buildings', () => {
    expect(
      resolveLocationInverseRelationshipDescription({
        kind: 'resides_at',
        location: buildingLocation(),
      }),
    ).toBe('Lives at this building as a primary residence.')
  })

  it('uses structure noun for untyped structures', () => {
    expect(
      resolveLocationInverseRelationshipDescription({
        kind: 'owns',
        location: {
          ...baseLocation,
          kind: 'structure',
        },
      }),
    ).toBe('Owns or holds title to this structure.')
  })

  it('describes works_at with inverse workplace copy', () => {
    expect(
      resolveLocationInverseRelationshipDescription({
        kind: 'works_at',
        location: buildingLocation(),
      }),
    ).toBe('Works at or is regularly present at this building.')
  })
})
