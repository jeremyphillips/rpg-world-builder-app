import { describe, expect, it } from 'vitest'

import {
  applyLocationCreateModalSetupValueChange,
  EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
  resolveLocationCreateModalSetupModel,
} from './location-create-modal-setup.lib'

describe('applyLocationCreateModalSetupValueChange', () => {
  it('clears regionType atomically when classification changes', () => {
    const next = applyLocationCreateModalSetupValueChange({
      values: {
        ...EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
        classificationKind: 'political',
        regionType: 'kingdom',
      },
      event: {
        setId: 'classification',
        previousValue: 'political',
        nextValue: 'geographic',
        invalidatedSetIds: ['regionType'],
      },
    })

    expect(next.classificationKind).toBe('geographic')
    expect(next.regionType).toBe('')
  })

  it('marks building form as skipped without a value', () => {
    const next = applyLocationCreateModalSetupValueChange({
      values: EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
      event: {
        setId: 'buildingForm',
        previousValue: '',
        nextValue: '',
        invalidatedSetIds: [],
        skipped: true,
      },
    })

    expect(next.buildingForm).toBe('')
    expect(next.buildingFormSkipped).toBe(true)
  })

  it('accepts empty clears for site and settlement types', () => {
    expect(
      applyLocationCreateModalSetupValueChange({
        values: { ...EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES, siteType: 'landmark' },
        event: {
          setId: 'siteType',
          previousValue: 'landmark',
          nextValue: '',
          invalidatedSetIds: [],
        },
      }).siteType,
    ).toBe('')

    expect(
      applyLocationCreateModalSetupValueChange({
        values: { ...EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES, settlementType: 'city' },
        event: {
          setId: 'settlementType',
          previousValue: 'city',
          nextValue: '',
          invalidatedSetIds: [],
        },
      }).settlementType,
    ).toBe('')
  })
})

describe('resolveLocationCreateModalSetupModel', () => {
  it('sequences optional Form before Facility discovery', () => {
    const model = resolveLocationCreateModalSetupModel({
      intent: { authoringType: 'building' },
      values: {
        ...EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
        buildingFacilityAuthoringGroup: 'browse_all',
      },
    })

    expect(
      model?.choiceSets.map(({ id, required, visibleWhenComplete }) => ({
        id,
        required,
        visibleWhenComplete,
      })),
    ).toEqual([
      { id: 'buildingForm', required: false, visibleWhenComplete: undefined },
      {
        id: 'buildingFacilityAuthoringGroup',
        required: undefined,
        visibleWhenComplete: ['buildingForm'],
      },
    ])
    expect(model?.canContinue).toBe(false)
  })

  it('allows continue after form is skipped and facility is selected', () => {
    const model = resolveLocationCreateModalSetupModel({
      intent: { authoringType: 'building' },
      values: {
        ...EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
        buildingFormSkipped: true,
        buildingFacilityAuthoringGroup: 'browse_all',
      },
    })

    expect(model?.canContinue).toBe(true)
    expect(model?.complete()).toEqual({ kind: 'building' })
  })

  it('projects authoring group into setup intent and summary, not Facility classification', () => {
    const model = resolveLocationCreateModalSetupModel({
      intent: { authoringType: 'building' },
      values: {
        ...EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
        buildingFormSkipped: true,
        buildingFacilityAuthoringGroup: 'production',
      },
    })

    expect(model?.complete()).toEqual({
      kind: 'building',
      facilityAuthoringGroup: 'production',
    })
    expect(model?.summaryEntries.map((entry) => entry.valueLabel)).toEqual(['Production'])
    expect(model?.complete()).not.toHaveProperty('facilityType')
  })

  it('builds shared region choice sets with dependsOn', () => {
    const model = resolveLocationCreateModalSetupModel({
      intent: { authoringType: 'region' },
      values: {
        ...EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
        classificationKind: 'political',
        regionType: 'kingdom',
      },
    })

    expect(model?.choiceSets.map((choiceSet) => choiceSet.id)).toEqual([
      'classification',
      'regionType',
    ])
    expect(model?.choiceSets.find((choiceSet) => choiceSet.id === 'regionType')?.dependsOn).toEqual(
      ['classification'],
    )
    expect(model?.canContinue).toBe(true)
    expect(model?.complete()).toEqual({
      kind: 'region',
      classification: { kind: 'political', type: 'kingdom' },
    })
  })
})
