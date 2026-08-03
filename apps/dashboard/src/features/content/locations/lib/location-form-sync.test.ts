import { describe, expect, it } from 'vitest'

import { applyAuthoringTypeValueSync, applyBuildingArchetypeValueSync } from './location-form-sync'

describe('applyBuildingArchetypeValueSync', () => {
  it('returns undefined when specialization and override are already clear', () => {
    expect(
      applyBuildingArchetypeValueSync({
        classification: { archetype: 'inn' },
      }),
    ).toBeUndefined()
  })

  it('clears specialization and function override when archetype changes', () => {
    expect(
      applyBuildingArchetypeValueSync({
        classification: {
          archetype: 'temple',
          specialization: 'Sea temple',
          functionOverride: 'care',
        },
      }),
    ).toEqual({
      classification: {
        archetype: 'temple',
        specialization: undefined,
        functionOverride: undefined,
      },
    })
  })
})

describe('applyAuthoringTypeValueSync', () => {
  it('clears building classification when switching to fortification', () => {
    expect(
      applyAuthoringTypeValueSync({
        authoringType: 'fortification',
        classification: {
          archetype: 'inn',
          specialization: 'Harbor inn',
          functionOverride: 'lodging',
        },
      }),
    ).toEqual({
      classification: {
        archetype: undefined,
        specialization: undefined,
        functionOverride: undefined,
      },
    })
  })

  it('clears building classification when switching to unclassified structure', () => {
    expect(
      applyAuthoringTypeValueSync({
        authoringType: 'structure',
        classification: { archetype: 'tavern' },
      }),
    ).toEqual({
      classification: {
        archetype: undefined,
      },
    })
  })

  it('clears stale building classification when switching from vessel to building', () => {
    expect(
      applyAuthoringTypeValueSync({
        authoringType: 'building',
        classification: { archetype: 'warehouse' },
      }),
    ).toBeUndefined()
  })

  it('clears structure and building fields when switching to region', () => {
    expect(
      applyAuthoringTypeValueSync({
        authoringType: 'region',
        classification: {
          archetype: 'inn',
          specialization: 'Harbor inn',
          functionOverride: 'lodging',
        },
      }),
    ).toEqual({
      classification: {
        archetype: undefined,
        specialization: undefined,
        functionOverride: undefined,
      },
    })
  })

  it('clears region classification when switching to building', () => {
    expect(
      applyAuthoringTypeValueSync({
        authoringType: 'building',
        classification: {
          kind: 'geographic',
          type: 'coast',
        },
      }),
    ).toEqual({
      classification: {
        kind: undefined,
        type: undefined,
      },
    })
  })

  it('clears subtype fields that do not belong to the selected authoring type', () => {
    expect(
      applyAuthoringTypeValueSync({
        authoringType: 'world',
        planeType: 'material',
        settlementType: 'city',
        siteType: 'dungeon',
        interiorType: 'room',
      }),
    ).toEqual({
      planeType: undefined,
      settlementType: undefined,
      siteType: undefined,
      interiorType: undefined,
    })
  })
})
