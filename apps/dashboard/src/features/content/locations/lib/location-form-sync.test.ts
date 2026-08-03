import { describe, expect, it } from 'vitest'

import {
  applyAuthoringTypeValueSync,
  applyBuildingArchetypeValueSync,
  locationFormValueSyncs,
} from './location-form-sync'

function applyRedundantFunctionOverrideSync(values: Record<string, unknown>) {
  const sync = locationFormValueSyncs.find(
    (entry) =>
      entry.dependsOn.includes('classification.functionOverride') &&
      entry.dependsOn.includes('classification.archetype'),
  )
  if (!sync) throw new Error('expected redundant function override sync')
  return sync.apply(values, ['classification.functionOverride'])
}

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

describe('redundant function override sync', () => {
  it('clears an override that repeats the selected archetype default', () => {
    expect(
      applyRedundantFunctionOverrideSync({
        authoringType: 'building',
        classification: {
          archetype: 'almshouse',
          functionOverride: 'care',
        },
      }),
    ).toEqual({
      classification: {
        archetype: 'almshouse',
        functionOverride: undefined,
      },
    })
  })

  it('keeps a meaningful override that differs from archetype defaults', () => {
    expect(
      applyRedundantFunctionOverrideSync({
        authoringType: 'building',
        classification: {
          archetype: 'temple',
          functionOverride: 'lodging',
        },
      }),
    ).toBeUndefined()
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
