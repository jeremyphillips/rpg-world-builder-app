import { describe, expect, it } from 'vitest'

import { getEffectiveBuildingFunctions } from '@rpg/contracts'

import {
  applyBuildingCreateSetupProjection,
  applyBuildingCreateSetupSelectionChange,
  buildBuildingFacilityAuthoringGroupRadioOptions,
  resolveBuildingCreateSetupProjection,
} from './location-building-create-setup.lib'

describe('Building create setup selection', () => {
  const emptySelection = { form: '', facilityAuthoringGroup: '', operatorIntent: '' } as const

  it('requires discovery scope and operator intent while leaving Form optional', () => {
    expect(resolveBuildingCreateSetupProjection(emptySelection)).toBeNull()
    expect(
      resolveBuildingCreateSetupProjection({ ...emptySelection, operatorIntent: 'none' }),
    ).toBeNull()
    expect(
      resolveBuildingCreateSetupProjection({
        ...emptySelection,
        facilityAuthoringGroup: 'browse_all',
        operatorIntent: 'none',
      }),
    ).toEqual({ operatorIntent: 'none' })
  })

  it('updates each Building setup field and ignores unrelated ids', () => {
    const withForm = applyBuildingCreateSetupSelectionChange({
      selection: emptySelection,
      choiceSetId: 'buildingForm',
      nextValue: 'house',
    })
    expect(withForm?.form).toBe('house')

    const withFacilityGroup = applyBuildingCreateSetupSelectionChange({
      selection: withForm!,
      choiceSetId: 'buildingFacilityAuthoringGroup',
      nextValue: 'production',
    })
    expect(withFacilityGroup?.facilityAuthoringGroup).toBe('production')

    expect(
      applyBuildingCreateSetupSelectionChange({
        selection: withFacilityGroup!,
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

  it('derives setup options from populated canonical Facility groups', () => {
    expect(buildBuildingFacilityAuthoringGroupRadioOptions().map((option) => option.value)).toEqual(
      ['residential', 'commercial', 'production', 'civic', 'religious', 'lodging', 'browse_all'],
    )
  })
})

describe('applyBuildingCreateSetupProjection', () => {
  const draft = {
    name: 'The Copper Kettle',
    description: 'A busy corner property.',
    authoringType: 'building' as const,
    classification: { form: 'house' as const, facilityType: 'brewery' as const },
  }

  it('clears an out-of-group Facility while preserving unrelated draft fields', () => {
    expect(
      applyBuildingCreateSetupProjection(draft, {
        facilityAuthoringGroup: 'religious',
        operatorIntent: 'create',
      }),
    ).toEqual({
      name: draft.name,
      description: draft.description,
      authoringType: 'building',
      classification: undefined,
    })
  })

  it('supports an unclassified Building end to end', () => {
    expect(
      applyBuildingCreateSetupProjection(
        { ...draft, classification: undefined },
        { operatorIntent: 'none' },
      ).classification,
    ).toBeUndefined()
  })

  it('preserves a Facility across compatible groups and keeps its derived function', () => {
    const production = applyBuildingCreateSetupProjection(draft, {
      facilityAuthoringGroup: 'production',
      operatorIntent: 'none',
    })
    const commercial = applyBuildingCreateSetupProjection(production, {
      facilityAuthoringGroup: 'commercial',
      operatorIntent: 'none',
    })

    expect(commercial.classification).toEqual({ facilityType: 'brewery' })
    expect(getEffectiveBuildingFunctions(commercial.classification)).toEqual(['production'])
  })
})
