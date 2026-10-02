import { describe, expect, it } from 'vitest'

import { createChoiceSetSummaryDefinitions, resolveSetupSummaryRows } from '@/lib/create-setup'

import {
  applyLocationCreateModalSetupValueChange,
  EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
  isLocationCreateModalSetupComplete,
  LOCATION_CREATE_MODAL_AUTHORING_TYPE_SET_ID,
  resolveLocationCreateModalSetupModel,
  resolveLocationCreateSetupAuthoringTypes,
  requiresLocationCreateSetup,
} from './location-create-modal-setup.lib'
import { buildLocationCreateSetupSets } from './location-create-setup.lib'
import {
  REGION_CREATE_SETUP_CLASSIFICATION_KIND_SET_ID,
  REGION_CREATE_SETUP_CLASSIFICATION_TYPE_SET_ID,
} from './location-region-create-setup.lib'

describe('applyLocationCreateModalSetupValueChange', () => {
  it('clears classification.type atomically when classification.kind changes', () => {
    const next = applyLocationCreateModalSetupValueChange({
      values: {
        ...EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
        classification: { kind: 'political', type: 'kingdom' },
      },
      event: {
        setId: REGION_CREATE_SETUP_CLASSIFICATION_KIND_SET_ID,
        previousValue: 'political',
        nextValue: 'geographic',
        invalidatedSetIds: [REGION_CREATE_SETUP_CLASSIFICATION_TYPE_SET_ID],
      },
    })

    expect(next.classification.kind).toBe('geographic')
    expect(next.classification.type).toBe('')

    const model = resolveLocationCreateModalSetupModel({
      intent: { authoringType: 'region' },
      values: next,
    })
    const sets = buildLocationCreateSetupSets(model!.choiceSets)
    const rows = resolveSetupSummaryRows(sets, createChoiceSetSummaryDefinitions(sets))

    expect(rows.map((row) => row.id)).toEqual([REGION_CREATE_SETUP_CLASSIFICATION_KIND_SET_ID])
    expect(rows.some((row) => row.id === REGION_CREATE_SETUP_CLASSIFICATION_TYPE_SET_ID)).toBe(
      false,
    )
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

describe('resolveLocationCreateSetupAuthoringTypes', () => {
  it('includes building, settlement, site, and region and excludes vessel and district', () => {
    const types = resolveLocationCreateSetupAuthoringTypes()
    expect(types).toEqual(expect.arrayContaining(['building', 'settlement', 'site', 'region']))
    expect(types).not.toContain('vessel')
    expect(types).not.toContain('district')
    expect(requiresLocationCreateSetup('building')).toBe(true)
    expect(requiresLocationCreateSetup('vessel')).toBe(false)
  })
})

describe('resolveLocationCreateModalSetupModel', () => {
  it('resets type-specific values when authoring type changes in the type step', () => {
    const withSite = applyLocationCreateModalSetupValueChange({
      values: {
        ...EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
        authoringType: 'site',
        siteType: 'ruin',
      },
      event: {
        setId: LOCATION_CREATE_MODAL_AUTHORING_TYPE_SET_ID,
        previousValue: 'site',
        nextValue: 'settlement',
        invalidatedSetIds: [],
      },
    })

    expect(withSite.authoringType).toBe('settlement')
    expect(withSite.siteType).toBe('')
  })

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
    expect(isLocationCreateModalSetupComplete(model!)).toBe(false)
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

    expect(isLocationCreateModalSetupComplete(model!)).toBe(true)
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
    const sets = buildLocationCreateSetupSets(model!.choiceSets)
    expect(
      resolveSetupSummaryRows(sets, createChoiceSetSummaryDefinitions(sets)).map(
        (row) => row.value,
      ),
    ).toEqual(['Not specified', 'Production'])
    expect(model?.complete()).not.toHaveProperty('facilityType')
  })

  it('builds shared region choice sets aligned with form field paths', () => {
    const model = resolveLocationCreateModalSetupModel({
      intent: { authoringType: 'region' },
      values: {
        ...EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
        classification: { kind: 'political', type: 'kingdom' },
      },
    })

    expect(model?.choiceSets.map((choiceSet) => choiceSet.id)).toEqual([
      REGION_CREATE_SETUP_CLASSIFICATION_KIND_SET_ID,
      REGION_CREATE_SETUP_CLASSIFICATION_TYPE_SET_ID,
    ])
    expect(
      model?.choiceSets.find(
        (choiceSet) => choiceSet.id === REGION_CREATE_SETUP_CLASSIFICATION_TYPE_SET_ID,
      )?.dependsOn,
    ).toEqual([REGION_CREATE_SETUP_CLASSIFICATION_KIND_SET_ID])
    expect(
      model?.choiceSets.find(
        (choiceSet) => choiceSet.id === REGION_CREATE_SETUP_CLASSIFICATION_KIND_SET_ID,
      )?.fieldLabel,
    ).toBe('Classification')
    expect(
      model?.choiceSets.find(
        (choiceSet) => choiceSet.id === REGION_CREATE_SETUP_CLASSIFICATION_TYPE_SET_ID,
      )?.fieldLabel,
    ).toBe('Political type')
    expect(
      model?.choiceSets.find(
        (choiceSet) => choiceSet.id === REGION_CREATE_SETUP_CLASSIFICATION_KIND_SET_ID,
      )?.summaryGroup,
    ).toBe('selections')
    expect(
      model?.choiceSets.find(
        (choiceSet) => choiceSet.id === REGION_CREATE_SETUP_CLASSIFICATION_TYPE_SET_ID,
      )?.summaryGroup,
    ).toBe('selections')
    expect(isLocationCreateModalSetupComplete(model!)).toBe(true)
    expect(model?.complete()).toEqual({
      kind: 'region',
      classification: { kind: 'political', type: 'kingdom' },
    })
  })

  it('exposes skippedValueLabel for optional building form skip rows', () => {
    const model = resolveLocationCreateModalSetupModel({
      intent: { authoringType: 'building' },
      values: {
        ...EMPTY_LOCATION_CREATE_MODAL_SETUP_VALUES,
        buildingFormSkipped: true,
      },
    })

    expect(
      model?.choiceSets.find((choiceSet) => choiceSet.id === 'buildingForm')?.skippedValueLabel,
    ).toBe('Not specified')
  })
})
