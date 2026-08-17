import { describe, expect, it } from 'vitest'

import { buildingClassificationSchema } from '@rpg/contracts'

import { makeLocation } from '@/test/fixtures/factories/location'

import { resolveLocationInverseRelationshipDescription } from './location-inverse-relationship-description'

function buildingLocation(overrides: Omit<Parameters<typeof makeLocation>[0], 'kind'> = {}) {
  return makeLocation({
    kind: 'structure',
    structureType: 'building',
    classification: buildingClassificationSchema.parse({ facilityType: 'brewery' }),
    ...overrides,
  })
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
        location: makeLocation({
          kind: 'structure',
          structureType: 'fortification',
        }),
      }),
    ).toBe("Runs or manages this fortification's day-to-day operations.")

    expect(
      resolveLocationInverseRelationshipDescription({
        kind: 'operator',
        location: makeLocation({
          kind: 'structure',
          structureType: 'vessel',
        }),
      }),
    ).toBe("Runs or manages this vessel's day-to-day operations.")
  })

  it('describes tenant at typed interior with the interior type noun', () => {
    expect(
      resolveLocationInverseRelationshipDescription({
        kind: 'tenant',
        location: makeLocation({
          kind: 'interior',
          interiorType: 'space',
          classification: { type: 'chamber' },
        }),
      }),
    ).toBe('Occupies or leases this space without owning it.')
  })

  it('uses geographic residence copy for settlements and districts', () => {
    expect(
      resolveLocationInverseRelationshipDescription({
        kind: 'resides_at',
        location: makeLocation({
          kind: 'settlement',
          settlementType: 'city',
          parentLocationId: 'loc_parent',
        }),
      }),
    ).toBe('Lives in this settlement.')

    expect(
      resolveLocationInverseRelationshipDescription({
        kind: 'resides_at',
        location: makeLocation({
          kind: 'district',
          parentLocationId: 'loc_parent',
        }),
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
    const untypedStructure = makeLocation({ kind: 'structure' })
    delete (untypedStructure as { structureType?: unknown }).structureType

    expect(
      resolveLocationInverseRelationshipDescription({
        kind: 'owns',
        location: untypedStructure,
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
