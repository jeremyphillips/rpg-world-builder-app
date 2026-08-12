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
      choiceSetId: 'classification',
      nextValue: 'geographic',
    })

    expect(next.classificationKind).toBe('geographic')
    expect(next.regionType).toBe('')
  })

  it('accepts empty clears for site and settlement types', () => {
    expect(
      applyLocationCreateModalSetupValueChange({
        values: { ...EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES, siteType: 'landmark' },
        choiceSetId: 'siteType',
        nextValue: '',
      }).siteType,
    ).toBe('')

    expect(
      applyLocationCreateModalSetupValueChange({
        values: { ...EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES, settlementType: 'city' },
        choiceSetId: 'settlementType',
        nextValue: '',
      }).settlementType,
    ).toBe('')
  })
})

describe('resolveLocationCreateModalSetupModel', () => {
  it('builds optional Form and Facility choices before required operator intent', () => {
    const model = resolveLocationCreateModalSetupModel({
      intent: { authoringType: 'building' },
      values: {
        ...EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
        buildingOperatorIntent: 'none',
      },
    })

    expect(model?.choiceSets.map(({ id, required }) => ({ id, required }))).toEqual([
      { id: 'buildingForm', required: false },
      { id: 'buildingFacilityType', required: false },
      { id: 'buildingOperatorIntent', required: undefined },
    ])
    expect(model?.canContinue).toBe(true)
    expect(model?.complete()).toEqual({ kind: 'building', operatorIntent: 'none' })
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
