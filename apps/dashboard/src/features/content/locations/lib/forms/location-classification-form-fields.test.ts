import { describe, expect, it } from 'vitest'

import {
  BUILDING_FACILITY_TYPE_ENTRIES,
  BUILDING_FACILITY_TYPE_IDS,
  BUILDING_FORM_ENTRIES,
  BUILDING_FORM_IDS,
} from '@rpg/contracts'

import { resolveFieldConfigPrimaryName, type ComboboxFieldConfig } from '@rpg/ui/form'

import {
  buildLocationClassificationFields,
  buildLocationPrimaryClassificationFields,
  hasVisibleLocationTypeDependentFields,
} from './location-classification-form-fields'

type FormItemLike = ReturnType<typeof buildLocationClassificationFields>[number]

function fieldByName(items: FormItemLike[], name: string) {
  const field = items.find(
    (item) => !('kind' in item) && resolveFieldConfigPrimaryName(item) === name,
  )
  if (!field) throw new Error(`expected field ${name}`)
  return field
}

function comboboxFieldByName(items: FormItemLike[], name: string): ComboboxFieldConfig {
  const field = fieldByName(items, name)
  if (!('type' in field) || field.type !== 'combobox') {
    throw new Error(`expected combobox field ${name}`)
  }
  return field
}

describe('Building classification fields', () => {
  it('projects Form first and Facility as the optional searchable secondary axis', () => {
    const primaryNames = buildLocationPrimaryClassificationFields().flatMap((item) =>
      'kind' in item ? [] : [resolveFieldConfigPrimaryName(item)],
    )
    const secondaryNames = buildLocationClassificationFields().flatMap((item) =>
      'kind' in item ? [] : [resolveFieldConfigPrimaryName(item)],
    )

    expect(primaryNames).toEqual([
      'planeType',
      'classification.kind',
      'settlementType',
      'siteType',
      'classification.form',
      'interiorType',
    ])
    expect(secondaryNames).toEqual([
      'classification.type',
      'classification.type',
      'classification.facilityType',
      'classification.type',
    ])
  })

  it('uses combobox with descriptions for plane type and region type', () => {
    const primary = buildLocationPrimaryClassificationFields()
    const secondary = buildLocationClassificationFields()

    expect(fieldByName(primary, 'planeType')).toMatchObject({
      type: 'combobox',
      multiple: false,
    })
    const planeOptions = comboboxFieldByName(primary, 'planeType').options ?? []
    expect(planeOptions.find((option) => option.value === 'material')).toMatchObject({
      description: expect.any(String),
    })

    const politicalTypeField = secondary.find(
      (item) => !('kind' in item) && 'label' in item && item.label === 'Political type',
    )
    const geographicTypeField = secondary.find(
      (item) => !('kind' in item) && 'label' in item && item.label === 'Geographic type',
    )
    if (
      !politicalTypeField ||
      !geographicTypeField ||
      !('type' in politicalTypeField) ||
      politicalTypeField.type !== 'combobox' ||
      !('type' in geographicTypeField) ||
      geographicTypeField.type !== 'combobox'
    ) {
      throw new Error('expected political and geographic type comboboxes')
    }

    const geographic = geographicTypeField.options ?? []
    const political = politicalTypeField.options ?? []

    expect(geographic.map((option) => option.value)).toContain('forest')
    expect(geographic.map((option) => option.value)).toContain('swamp')
    expect(geographic.map((option) => option.value)).not.toContain('kingdom')
    expect(political.map((option) => option.value)).toContain('kingdom')
    expect(political.map((option) => option.value)).not.toContain('forest')
    expect(geographic.find((option) => option.value === 'forest')).toMatchObject({
      description: expect.any(String),
    })
  })

  it('uses chips for region classification and settlement type, combobox for site type', () => {
    const primary = buildLocationPrimaryClassificationFields()

    expect(fieldByName(primary, 'classification.kind')).toMatchObject({
      type: 'chips',
      multiple: false,
    })
    expect(fieldByName(primary, 'settlementType')).toMatchObject({
      type: 'chips',
      multiple: false,
    })
    expect(fieldByName(primary, 'siteType')).toMatchObject({
      type: 'combobox',
      multiple: false,
    })
    const siteOptions = comboboxFieldByName(primary, 'siteType').options ?? []
    expect(siteOptions.find((option) => option.value === 'landmark')).toMatchObject({
      description: expect.any(String),
    })
  })

  it('derives Form and searchable Facility options from their authoritative registries', () => {
    expect(
      fieldByName(buildLocationPrimaryClassificationFields(), 'classification.form'),
    ).toMatchObject({
      type: 'combobox',
      label: 'Form',
      multiple: false,
      width: 'lg',
      options: BUILDING_FORM_IDS.map((id) => ({
        value: id,
        label: BUILDING_FORM_ENTRIES[id].label,
        description: BUILDING_FORM_ENTRIES[id].description,
      })),
    })
    expect(
      fieldByName(buildLocationClassificationFields(), 'classification.facilityType'),
    ).toMatchObject({
      type: 'combobox',
      label: 'Facility type',
      multiple: false,
      options: BUILDING_FACILITY_TYPE_IDS.map((id) => ({
        value: id,
        label: BUILDING_FACILITY_TYPE_ENTRIES[id].label,
      })),
    })
  })

  it('scopes initial Facility suggestions but searches the complete registry', () => {
    const field = fieldByName(
      buildLocationClassificationFields({ buildingFacilityAuthoringGroup: 'production' }),
      'classification.facilityType',
    )
    if (!('type' in field) || field.type !== 'combobox') {
      throw new Error('Expected Facility combobox')
    }
    const options = field.options ?? []

    expect(field.resolveFilteredOptions?.(options, '', [])).toMatchObject([
      { value: 'warehouse' },
      { value: 'barn' },
      { value: 'bakery' },
      { value: 'granary' },
      { value: 'greenhouse' },
      { value: 'brewery' },
      { value: 'distillery' },
      { value: 'factory' },
      { value: 'mill' },
      { value: 'workshop' },
    ])
    expect(field.resolveFilteredOptions?.(options, 'artisan', [])).toMatchObject([
      { value: 'workshop' },
    ])
    expect(field.resolveFilteredOptions?.(options, 'temple', [])).toMatchObject([
      { value: 'temple' },
    ])
    expect(field.resolveFilteredOptions?.(options, 'livery', [])).toMatchObject([
      { value: 'stable' },
    ])
  })

  it('scopes Commercial suggestions and resolves Phase 20 Facilities via searchTerms', () => {
    const field = fieldByName(
      buildLocationClassificationFields({ buildingFacilityAuthoringGroup: 'commercial' }),
      'classification.facilityType',
    )
    if (!('type' in field) || field.type !== 'combobox') {
      throw new Error('Expected Facility combobox')
    }
    const options = field.options ?? []

    const scoped = field.resolveFilteredOptions?.(options, '', []) ?? []
    expect(scoped.map((option) => option.value)).toEqual([
      'inn',
      'tavern',
      'market',
      'shop',
      'bank',
      'office',
      'warehouse',
      'barn',
      'bakery',
      'brewery',
      'distillery',
      'workshop',
      'auction_house',
      'arena',
      'bathhouse',
      'theater',
      'stable',
    ])
    expect(field.resolveFilteredOptions?.(options, 'counting house', [])).toMatchObject([
      { value: 'office' },
    ])
    expect(field.resolveFilteredOptions?.(options, 'auction', [])).toMatchObject([
      { value: 'auction_house' },
    ])
  })

  it('scopes Civic suggestions including Office without splitting the group', () => {
    const field = fieldByName(
      buildLocationClassificationFields({ buildingFacilityAuthoringGroup: 'civic' }),
      'classification.facilityType',
    )
    if (!('type' in field) || field.type !== 'combobox') {
      throw new Error('Expected Facility combobox')
    }
    const options = field.options ?? []

    const scoped = field.resolveFilteredOptions?.(options, '', []) ?? []
    expect(scoped.map((option) => option.value)).toEqual([
      'office',
      'town_hall',
      'guildhall',
      'courthouse',
      'embassy',
      'prison',
      'barracks',
      'checkpoint',
      'armory',
      'watchtower',
      'library',
      'schoolhouse',
      'lighthouse',
      'observatory',
      'archive',
      'arena',
      'bathhouse',
      'hospital',
      'theater',
    ])
  })
})

describe('interior classification UI gate', () => {
  it('keeps interior fields in config but hides them from authoring UI', () => {
    const interiorType = fieldByName(buildLocationPrimaryClassificationFields(), 'interiorType')
    const interiorSpaceType = buildLocationClassificationFields().find(
      (item) =>
        !('kind' in item) &&
        resolveFieldConfigPrimaryName(item) === 'classification.type' &&
        'label' in item &&
        item.label === 'Interior space type',
    )
    if (!interiorSpaceType) throw new Error('expected interior space type field')

    expect(interiorType.visibility?.visibleWhen?.({ authoringType: 'interior' })).toBe(false)
    expect(
      interiorSpaceType.visibility?.visibleWhen?.({
        authoringType: 'interior',
        interiorType: 'room',
      }),
    ).toBe(false)
  })
})

describe('hasVisibleLocationTypeDependentFields', () => {
  it('is false when no classification fields apply to the selected type', () => {
    expect(hasVisibleLocationTypeDependentFields({ authoringType: 'world' })).toBe(false)
    expect(hasVisibleLocationTypeDependentFields({ authoringType: 'district' })).toBe(false)
    expect(hasVisibleLocationTypeDependentFields({ authoringType: 'fortification' })).toBe(false)
  })

  it('is true when a type-specific field would render', () => {
    expect(hasVisibleLocationTypeDependentFields({ authoringType: 'plane' })).toBe(true)
    expect(hasVisibleLocationTypeDependentFields({ authoringType: 'region' })).toBe(true)
    expect(hasVisibleLocationTypeDependentFields({ authoringType: 'building' })).toBe(true)
  })
})
