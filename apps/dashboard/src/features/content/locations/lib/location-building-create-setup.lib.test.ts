import { describe, expect, it } from 'vitest'

import { getEffectiveBuildingFunctions } from '@rpg/contracts'

import {
  applyBuildingCreateSetupProjection,
  applyBuildingCreateSetupSelectionChange,
  resolveBuildingCreateSetupProjection,
} from './location-building-create-setup.lib'

describe('Building create setup selection', () => {
  const emptySelection = { form: '', facilityType: '', operatorIntent: '' } as const

  it('requires operator intent while leaving Form and Facility optional', () => {
    expect(resolveBuildingCreateSetupProjection(emptySelection)).toBeNull()
    expect(
      resolveBuildingCreateSetupProjection({ ...emptySelection, operatorIntent: 'none' }),
    ).toEqual({ operatorIntent: 'none' })
  })

  it('updates each Building setup field and ignores unrelated ids', () => {
    const withForm = applyBuildingCreateSetupSelectionChange({
      selection: emptySelection,
      choiceSetId: 'buildingForm',
      nextValue: 'house',
    })
    expect(withForm?.form).toBe('house')

    const withFacility = applyBuildingCreateSetupSelectionChange({
      selection: withForm!,
      choiceSetId: 'buildingFacilityType',
      nextValue: 'brewery',
    })
    expect(withFacility?.facilityType).toBe('brewery')

    expect(
      applyBuildingCreateSetupSelectionChange({
        selection: withFacility!,
        choiceSetId: 'buildingOperatorIntent',
        nextValue: 'create',
      })?.operatorIntent,
    ).toBe('create')
    expect(
      applyBuildingCreateSetupSelectionChange({
        selection: emptySelection,
        choiceSetId: 'settlementType',
        nextValue: 'city',
      }),
    ).toBeNull()
  })
})

describe('applyBuildingCreateSetupProjection', () => {
  const draft = {
    name: 'The Copper Kettle',
    description: 'A busy corner property.',
    authoringType: 'building' as const,
    classification: { form: 'house' as const, facilityType: 'brewery' as const },
  }

  it('updates only canonical Building classification and preserves unrelated draft fields', () => {
    expect(
      applyBuildingCreateSetupProjection(draft, {
        facilityType: 'temple',
        operatorIntent: 'create',
      }),
    ).toEqual({
      name: draft.name,
      description: draft.description,
      authoringType: 'building',
      classification: { facilityType: 'temple' },
    })
  })

  it('supports an unclassified Building end to end', () => {
    expect(
      applyBuildingCreateSetupProjection(draft, { operatorIntent: 'none' }).classification,
    ).toBeUndefined()
  })

  it('changes derived functions when Facility changes from Brewery to Temple', () => {
    const brewery = applyBuildingCreateSetupProjection(draft, {
      facilityType: 'brewery',
      operatorIntent: 'none',
    })
    const temple = applyBuildingCreateSetupProjection(brewery, {
      facilityType: 'temple',
      operatorIntent: 'none',
    })

    expect(getEffectiveBuildingFunctions(brewery.classification)).toEqual(['production'])
    expect(getEffectiveBuildingFunctions(temple.classification)).toEqual(['worship'])
  })
})
