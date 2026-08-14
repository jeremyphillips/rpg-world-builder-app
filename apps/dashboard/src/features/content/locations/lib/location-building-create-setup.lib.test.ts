import { describe, expect, it } from 'vitest'

import {
  BUILDING_FACILITY_TYPE_IDS,
  BUILDING_FORM_ENTRIES,
  BUILDING_FORM_IDS,
  getBuildingFacilityTypesForAuthoringGroup,
  getEffectiveBuildingFunctions,
} from '@rpg/contracts'

import {
  applyBuildingCreateSetupProjection,
  applyBuildingCreateSetupSelectionChange,
  buildBuildingFacilityAuthoringGroupRadioOptions,
  buildBuildingFormRadioOptions,
  resolveBuildingCreateSetupProjection,
} from './location-building-create-setup.lib'

describe('Building create setup selection', () => {
  const emptySelection = { form: '', facilityAuthoringGroup: '' } as const

  it('requires discovery scope while leaving Form optional', () => {
    expect(resolveBuildingCreateSetupProjection(emptySelection)).toBeNull()
    expect(
      resolveBuildingCreateSetupProjection({
        ...emptySelection,
        facilityAuthoringGroup: 'browse_all',
      }),
    ).toEqual({})
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

  it('derives Form radio options from the canonical registry without allowlists', () => {
    expect(buildBuildingFormRadioOptions()).toEqual(
      BUILDING_FORM_IDS.map((value) => ({
        value,
        label: BUILDING_FORM_ENTRIES[value].label,
        description: BUILDING_FORM_ENTRIES[value].description,
      })),
    )
  })

  it('accepts tower, hall, and keep selections without Form-to-Facility filtering', () => {
    const withTower = applyBuildingCreateSetupSelectionChange({
      selection: emptySelection,
      choiceSetId: 'buildingForm',
      nextValue: 'tower',
    })
    expect(withTower?.form).toBe('tower')

    const withHall = applyBuildingCreateSetupSelectionChange({
      selection: emptySelection,
      choiceSetId: 'buildingForm',
      nextValue: 'hall',
    })
    expect(withHall?.form).toBe('hall')

    const withKeep = applyBuildingCreateSetupSelectionChange({
      selection: emptySelection,
      choiceSetId: 'buildingForm',
      nextValue: 'keep',
    })
    expect(withKeep?.form).toBe('keep')

    const towerProjection = resolveBuildingCreateSetupProjection({
      form: 'tower',
      facilityAuthoringGroup: 'religious',
    })
    expect(towerProjection).toEqual({ form: 'tower', facilityAuthoringGroup: 'religious' })

    const keepProjection = resolveBuildingCreateSetupProjection({
      form: 'keep',
      facilityAuthoringGroup: 'civic',
    })
    expect(keepProjection).toEqual({ form: 'keep', facilityAuthoringGroup: 'civic' })
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
      applyBuildingCreateSetupProjection({ ...draft, classification: undefined }, {})
        .classification,
    ).toBeUndefined()
  })

  it('preserves a Facility across compatible groups and keeps its derived function', () => {
    const production = applyBuildingCreateSetupProjection(draft, {
      facilityAuthoringGroup: 'production',
    })
    const commercial = applyBuildingCreateSetupProjection(production, {
      facilityAuthoringGroup: 'commercial',
    })

    expect(commercial.classification).toEqual({ facilityType: 'brewery' })
    expect(getEffectiveBuildingFunctions(commercial.classification)).toEqual(['production'])
  })
})

describe('Phase 20 authoring/discovery review (20C)', () => {
  it('keeps Production and Commercial groups scannable at 40 Facilities', () => {
    expect(BUILDING_FACILITY_TYPE_IDS).toHaveLength(40)
    expect(getBuildingFacilityTypesForAuthoringGroup('production')).toHaveLength(10)
    expect(getBuildingFacilityTypesForAuthoringGroup('commercial')).toHaveLength(17)
    expect(getBuildingFacilityTypesForAuthoringGroup('civic')).toHaveLength(19)
  })

  it('includes Phase 20 promoted Facilities in the expected discovery groups', () => {
    const production = new Set(getBuildingFacilityTypesForAuthoringGroup('production'))
    const commercial = new Set(getBuildingFacilityTypesForAuthoringGroup('commercial'))
    const civic = new Set(getBuildingFacilityTypesForAuthoringGroup('civic'))

    expect(production.has('workshop')).toBe(true)
    expect(production.has('bakery')).toBe(true)
    expect(commercial.has('workshop')).toBe(true)
    expect(commercial.has('bakery')).toBe(true)
    expect(commercial.has('auction_house')).toBe(true)
    expect(commercial.has('office')).toBe(true)
    expect(civic.has('office')).toBe(true)
    expect(civic.has('auction_house')).toBe(false)
  })
})
