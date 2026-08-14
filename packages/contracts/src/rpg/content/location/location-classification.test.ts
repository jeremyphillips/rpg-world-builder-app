import { describe, expect, it } from 'vitest'

import {
  getEffectiveBuildingFunctions,
  INTERIOR_TYPE_DEFINITIONS,
  INTERIOR_TYPE_IDS,
  REGION_CLASSIFICATION_DEFINITIONS,
  REGION_CLASSIFICATION_KIND_IDS,
  getInteriorSubtypeIds,
  getRegionTypeIds,
} from '../../vocab/location'
import { locationBodySchema } from './location'

describe('location classification registries', () => {
  it('keeps region classification keys aligned with type vocabularies', () => {
    expect(REGION_CLASSIFICATION_KIND_IDS).toEqual(['political', 'geographic'])

    for (const kind of REGION_CLASSIFICATION_KIND_IDS) {
      const definition = REGION_CLASSIFICATION_DEFINITIONS[kind]
      const typeIds = getRegionTypeIds(kind)
      expect(typeIds.length).toBeGreaterThan(0)
      expect(Object.keys(definition.types).sort()).toEqual([...typeIds].sort())
    }
  })

  it('keeps interior subtype ids owned by their interior type', () => {
    for (const interiorType of INTERIOR_TYPE_IDS) {
      const subtypeIds = getInteriorSubtypeIds(interiorType)
      expect(subtypeIds.length).toBeGreaterThan(0)
      expect(Object.keys(INTERIOR_TYPE_DEFINITIONS[interiorType].subtypes).sort()).toEqual(
        [...subtypeIds].sort(),
      )
    }
  })
})

describe('getEffectiveBuildingFunctions', () => {
  it('returns Facility defaults', () => {
    expect(getEffectiveBuildingFunctions({ facilityType: 'brewery' })).toEqual(['production'])
    expect(getEffectiveBuildingFunctions({ facilityType: 'temple' })).toEqual(['worship'])
  })

  it('returns no functions for Form-only or unclassified buildings', () => {
    expect(getEffectiveBuildingFunctions({ form: 'house' })).toEqual([])
    expect(getEffectiveBuildingFunctions(undefined)).toEqual([])
  })
})

describe('location classification schema rejection', () => {
  it('accepts representative classified region, structure, and interior bodies', () => {
    expect(
      locationBodySchema.parse({
        kind: 'region',
        name: 'Sword Coast',
        parentLocationId: 'world-faerun',
        classification: { kind: 'geographic', type: 'coast' },
      }),
    ).toMatchObject({
      classification: { kind: 'geographic', type: 'coast' },
    })

    expect(
      locationBodySchema.parse({
        kind: 'structure',
        name: 'Yawning Portal',
        parentLocationId: 'district-dock-ward',
        structureType: 'building',
        classification: { facilityType: 'brewery' },
      }),
    ).toMatchObject({
      structureType: 'building',
      classification: { facilityType: 'brewery' },
    })

    expect(
      locationBodySchema.parse({
        kind: 'structure',
        name: 'North Wall',
        parentLocationId: 'settlement-waterdeep',
        structureType: 'fortification',
      }),
    ).toMatchObject({ structureType: 'fortification' })

    expect(
      locationBodySchema.parse({
        kind: 'interior',
        name: 'Audience Chamber',
        parentLocationId: 'structure-yawning-portal',
        interiorType: 'space',
        classification: { type: 'chamber' },
      }),
    ).toMatchObject({
      interiorType: 'space',
      classification: { type: 'chamber' },
    })
  })

  it('accepts independent Form and Facility axes', () => {
    expect(
      locationBodySchema.parse({
        kind: 'structure',
        name: 'Healing Temple',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: {
          form: 'house',
          facilityType: 'temple',
        },
      }),
    ).toMatchObject({
      classification: {
        form: 'house',
        facilityType: 'temple',
      },
    })
  })

  it('accepts tower and hall form-only and composed classifications', () => {
    expect(
      locationBodySchema.parse({
        kind: 'structure',
        name: 'Watch Spire',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: { form: 'tower' },
      }),
    ).toMatchObject({ classification: { form: 'tower' } })

    expect(
      locationBodySchema.parse({
        kind: 'structure',
        name: 'Great Hall',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: { form: 'hall' },
      }),
    ).toMatchObject({ classification: { form: 'hall' } })

    expect(
      locationBodySchema.parse({
        kind: 'structure',
        name: 'Temple Spire',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: { form: 'tower', facilityType: 'temple' },
      }),
    ).toMatchObject({
      classification: { form: 'tower', facilityType: 'temple' },
    })

    expect(
      locationBodySchema.parse({
        kind: 'structure',
        name: 'Civic Hall',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: { form: 'hall', facilityType: 'town_hall' },
      }),
    ).toMatchObject({
      classification: { form: 'hall', facilityType: 'town_hall' },
    })
  })

  it('accepts keep form-only and composed classifications', () => {
    expect(
      locationBodySchema.parse({
        kind: 'structure',
        name: 'Stone Keep',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: { form: 'keep' },
      }),
    ).toMatchObject({ classification: { form: 'keep' } })

    expect(
      locationBodySchema.parse({
        kind: 'structure',
        name: 'Lord Keep',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: { form: 'keep', facilityType: 'residence' },
      }),
    ).toMatchObject({
      classification: { form: 'keep', facilityType: 'residence' },
    })

    expect(
      locationBodySchema.parse({
        kind: 'structure',
        name: 'Garrison Keep',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: { form: 'keep', facilityType: 'barracks' },
      }),
    ).toMatchObject({
      classification: { form: 'keep', facilityType: 'barracks' },
    })
  })

  it('accepts Facility tranche compositions without pair allowlists', () => {
    expect(
      locationBodySchema.parse({
        kind: 'structure',
        name: 'Corner Shop',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: { form: 'house', facilityType: 'shop' },
      }),
    ).toMatchObject({ classification: { form: 'house', facilityType: 'shop' } })

    expect(
      locationBodySchema.parse({
        kind: 'structure',
        name: 'Watch Spire',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: { form: 'tower', facilityType: 'watchtower' },
      }),
    ).toMatchObject({ classification: { form: 'tower', facilityType: 'watchtower' } })

    expect(
      locationBodySchema.parse({
        kind: 'structure',
        name: 'Craft Hall',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: { form: 'hall', facilityType: 'guildhall' },
      }),
    ).toMatchObject({ classification: { form: 'hall', facilityType: 'guildhall' } })

    expect(
      locationBodySchema.parse({
        kind: 'structure',
        name: 'Castle Armory',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: { form: 'keep', facilityType: 'armory' },
      }),
    ).toMatchObject({ classification: { form: 'keep', facilityType: 'armory' } })

    expect(
      locationBodySchema.parse({
        kind: 'structure',
        name: 'Record House',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: { form: 'house', facilityType: 'archive' },
      }),
    ).toMatchObject({ classification: { form: 'house', facilityType: 'archive' } })
  })

  it('accepts Form-only, Facility-only, and unclassified buildings', () => {
    expect(
      locationBodySchema.parse({
        kind: 'structure',
        name: 'Desert Rest',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: { form: 'house' },
      }),
    ).toMatchObject({ classification: { form: 'house' } })

    expect(
      locationBodySchema.parse({
        kind: 'structure',
        name: 'Neighborhood Residence',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: { facilityType: 'residence' },
      }),
    ).toMatchObject({ classification: { facilityType: 'residence' } })

    const unclassified = locationBodySchema.parse({
      kind: 'structure',
      name: 'Unfinished Hall',
      parentLocationId: 'site-1',
      structureType: 'building',
    })
    expect(unclassified).toMatchObject({ structureType: 'building' })
    expect(unclassified).not.toHaveProperty('classification')
  })

  it('rejects invalid Form, Facility, and empty classification', () => {
    expect(
      locationBodySchema.safeParse({
        kind: 'structure',
        name: 'Bad Building',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: { form: 'gatehouse' },
      }).success,
    ).toBe(false)

    expect(
      locationBodySchema.safeParse({
        kind: 'structure',
        name: 'Bad Facility',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: { facilityType: 'workshop' },
      }).success,
    ).toBe(false)

    expect(
      locationBodySchema.safeParse({
        kind: 'structure',
        name: 'Empty Classification',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: {},
      }).success,
    ).toBe(false)
  })

  it('rejects building classification on non-building structure types', () => {
    expect(
      locationBodySchema.safeParse({
        kind: 'structure',
        name: 'North Wall',
        parentLocationId: 'settlement-1',
        structureType: 'fortification',
        classification: { facilityType: 'brewery' },
      }).success,
    ).toBe(false)
  })

  it('rejects stale type/subtype building classification shape', () => {
    expect(
      locationBodySchema.safeParse({
        kind: 'structure',
        name: 'Legacy Tavern',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: { type: 'business', subtype: 'tavern' },
      }).success,
    ).toBe(false)
  })

  it('rejects interior classification type mismatched to interiorType', () => {
    expect(
      locationBodySchema.safeParse({
        kind: 'interior',
        name: 'Wrong Room',
        parentLocationId: 'structure-1',
        interiorType: 'space',
        classification: { type: 'corridor' },
      }).success,
    ).toBe(false)
  })

  it('rejects legacy flat regionType on publish body input', () => {
    expect(
      locationBodySchema.safeParse({
        kind: 'region',
        name: 'Sword Coast',
        parentLocationId: 'world-1',
        regionType: 'coast',
      }).success,
    ).toBe(false)
  })
})
