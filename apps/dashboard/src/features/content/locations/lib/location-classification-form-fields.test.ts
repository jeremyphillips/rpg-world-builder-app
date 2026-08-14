import { describe, expect, it } from 'vitest'

import {
  BUILDING_FACILITY_TYPE_ENTRIES,
  BUILDING_FACILITY_TYPE_IDS,
  BUILDING_FORM_ENTRIES,
  BUILDING_FORM_IDS,
} from '@rpg/contracts'

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

    expect(field.resolveFilteredOptions?.(field.options, '', [])).toMatchObject([
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
    expect(field.resolveFilteredOptions?.(field.options, 'artisan', [])).toMatchObject([
      { value: 'workshop' },
    ])
    expect(field.resolveFilteredOptions?.(field.options, 'temple', [])).toMatchObject([
      { value: 'temple' },
    ])
    expect(field.resolveFilteredOptions?.(field.options, 'livery', [])).toMatchObject([
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

    const scoped = field.resolveFilteredOptions?.(field.options, '', []) ?? []
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
    expect(field.resolveFilteredOptions?.(field.options, 'counting house', [])).toMatchObject([
      { value: 'office' },
    ])
    expect(field.resolveFilteredOptions?.(field.options, 'auction', [])).toMatchObject([
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

    const scoped = field.resolveFilteredOptions?.(field.options, '', []) ?? []
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
