import { describe, expect, it } from 'vitest'

import { BUILDING_FORM_ENTRIES, BUILDING_FORM_IDS } from '@rpg/contracts'

import {
  buildLocationClassificationFields,
  buildLocationPrimaryClassificationFields,
} from './location-classification-form-fields'

type FormItemLike = ReturnType<typeof buildLocationClassificationFields>[number]

function fieldByName(items: FormItemLike[], name: string) {
  const field = items.find((item) => !('kind' in item) && item.name === name)
  if (!field) throw new Error(`expected field ${name}`)
  return field
}

describe('Building classification fields', () => {
  it('projects Form first and Facility as the optional searchable secondary axis', () => {
    const primaryNames = buildLocationPrimaryClassificationFields().flatMap((item) =>
      'kind' in item ? [] : [item.name],
    )
    const secondaryNames = buildLocationClassificationFields().flatMap((item) =>
      'kind' in item ? [] : [item.name],
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
      'classification.facilityType',
      'classification.type',
    ])
  })

  it('derives Form and searchable Facility options from their authoritative registries', () => {
    expect(
      fieldByName(buildLocationPrimaryClassificationFields(), 'classification.form'),
    ).toMatchObject({
      type: 'select',
      label: 'Form',
      options: BUILDING_FORM_IDS.map((id) => ({
        value: id,
        label: BUILDING_FORM_ENTRIES[id].label,
      })),
    })
    expect(
      fieldByName(buildLocationClassificationFields(), 'classification.facilityType'),
    ).toMatchObject({
      type: 'combobox',
      label: 'Facility type',
      multiple: false,
      options: [
        { value: 'residence', label: 'Residence' },
        { value: 'apartment_building', label: 'Apartment building' },
        { value: 'boarding_house', label: 'Boarding house' },
        { value: 'inn', label: 'Inn' },
        { value: 'tavern', label: 'Tavern' },
        { value: 'market', label: 'Market' },
        { value: 'bank', label: 'Bank' },
        { value: 'warehouse', label: 'Warehouse' },
        { value: 'brewery', label: 'Brewery' },
        { value: 'distillery', label: 'Distillery' },
        { value: 'factory', label: 'Factory' },
        { value: 'mill', label: 'Mill' },
        { value: 'town_hall', label: 'Town hall' },
        { value: 'courthouse', label: 'Courthouse' },
        { value: 'prison', label: 'Prison' },
        { value: 'barracks', label: 'Barracks' },
        { value: 'library', label: 'Library' },
        { value: 'hospital', label: 'Hospital' },
        { value: 'temple', label: 'Temple' },
        { value: 'theater', label: 'Theater' },
        { value: 'stable', label: 'Stable' },
      ],
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

    expect(field.resolveFilteredOptions?.(field.options, '', [])).toMatchObject([
      { value: 'warehouse' },
      { value: 'brewery' },
      { value: 'distillery' },
      { value: 'factory' },
      { value: 'mill' },
    ])
    expect(field.resolveFilteredOptions?.(field.options, 'temple', [])).toMatchObject([
      { value: 'temple' },
    ])
    expect(field.resolveFilteredOptions?.(field.options, 'livery', [])).toMatchObject([
      { value: 'stable' },
    ])
  })
})
