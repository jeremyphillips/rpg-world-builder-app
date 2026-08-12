import { describe, expect, it } from 'vitest'

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

  it('derives Form and searchable Facility options from their narrow registries', () => {
    expect(
      fieldByName(buildLocationPrimaryClassificationFields(), 'classification.form'),
    ).toMatchObject({
      type: 'select',
      label: 'Form',
      options: [{ value: 'house', label: 'House' }],
    })
    expect(
      fieldByName(buildLocationClassificationFields(), 'classification.facilityType'),
    ).toMatchObject({
      type: 'combobox',
      label: 'Facility type',
      multiple: false,
      options: [
        { value: 'residence', label: 'Residence' },
        { value: 'brewery', label: 'Brewery' },
        { value: 'temple', label: 'Temple' },
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
      { value: 'brewery' },
    ])
    expect(field.resolveFilteredOptions?.(field.options, 'temple', [])).toMatchObject([
      { value: 'temple' },
    ])
  })
})
