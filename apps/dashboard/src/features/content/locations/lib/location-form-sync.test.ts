import { describe, expect, it } from 'vitest'

import { applyAuthoringTypeValueSync } from './location-form-sync'

describe('applyAuthoringTypeValueSync', () => {
  it('clears building classification when switching to fortification', () => {
    expect(
      applyAuthoringTypeValueSync({
        authoringType: 'fortification',
        classification: {
          form: 'house',
          facilityType: 'residence',
        },
      }),
    ).toEqual({
      classification: {
        form: undefined,
        facilityType: undefined,
      },
    })
  })

  it('clears building classification when switching to unclassified structure', () => {
    expect(
      applyAuthoringTypeValueSync({
        authoringType: 'structure',
        classification: { facilityType: 'brewery' },
      }),
    ).toEqual({
      classification: {
        facilityType: undefined,
      },
    })
  })

  it('clears stale building classification when switching from vessel to building', () => {
    expect(
      applyAuthoringTypeValueSync({
        authoringType: 'building',
        classification: { form: 'house' },
      }),
    ).toBeUndefined()
  })

  it('clears structure and building fields when switching to region', () => {
    expect(
      applyAuthoringTypeValueSync({
        authoringType: 'region',
        classification: {
          form: 'house',
          facilityType: 'residence',
        },
      }),
    ).toEqual({
      classification: {
        form: undefined,
        facilityType: undefined,
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
