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
  it('projects Form first and Facility as the optional secondary axis', () => {
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

  it('derives Form and Facility options from their narrow registries', () => {
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
      type: 'select',
      label: 'Facility type',
      options: [
        { value: 'residence', label: 'Residence' },
        { value: 'brewery', label: 'Brewery' },
        { value: 'temple', label: 'Temple' },
      ],
    })
  })
})
