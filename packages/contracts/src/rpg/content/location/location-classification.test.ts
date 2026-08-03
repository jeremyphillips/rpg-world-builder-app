import { describe, expect, it } from 'vitest'

import {
  BUILDING_TYPE_DEFINITIONS,
  BUILDING_TYPE_IDS,
  getBuildingSubtypeIds,
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

  it('keeps building subtype ids owned by their building type', () => {
    for (const type of BUILDING_TYPE_IDS) {
      const subtypeIds = getBuildingSubtypeIds(type)
      expect(subtypeIds.length).toBeGreaterThan(0)
      expect(Object.keys(BUILDING_TYPE_DEFINITIONS[type].subtypes).sort()).toEqual(
        [...subtypeIds].sort(),
      )
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
        classification: { type: 'business', subtype: 'tavern' },
      }),
    ).toMatchObject({
      structureType: 'building',
      classification: { type: 'business', subtype: 'tavern' },
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

  it('rejects wrong building subtype for type', () => {
    expect(
      locationBodySchema.safeParse({
        kind: 'structure',
        name: 'Bad Tavern',
        parentLocationId: 'site-1',
        structureType: 'building',
        classification: { type: 'business', subtype: 'temple' },
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
