import { describe, expect, it } from 'vitest'
import { optionMatchesQuery } from '@rpg/ui'
import { ORGANIZATION_PRACTICE_TERM, vocabularyTermFieldCopy } from '@rpg/contracts'
import type { FieldOption, FormItem } from '@rpg/ui/form'
import { flattenSelectFieldOptions } from '@rpg/ui/form'

import { makeContentFormCtx } from '../fixtures/content-form-ctx'
import {
  buildOrganizationCreateInput,
  buildOrganizationFields,
  buildOrganizationFormValueSyncs,
  organizationDraftFormSchema,
} from './organization-form-projection'

function collectFields(items: readonly FormItem[]): Array<{ name: string; item: FormItem }> {
  const fields: Array<{ name: string; item: FormItem }> = []
  for (const item of items) {
    if ('name' in item && typeof item.name === 'string') fields.push({ name: item.name, item })
    if ('fields' in item && Array.isArray(item.fields)) fields.push(...collectFields(item.fields))
  }
  return fields
}

function presetPickerOptions(fields: ReturnType<typeof collectFields>): FieldOption[] {
  const presetField = fields.find(({ name }) => name === 'authoringPresetId')?.item
  expect(presetField && 'options' in presetField).toBe(true)
  if (!presetField || !('options' in presetField) || !Array.isArray(presetField.options)) {
    return []
  }
  return flattenSelectFieldOptions(presetField.options)
}

describe('organization form projection', () => {
  it('accepts the blank sentinel from an untouched authoring preset picker', () => {
    expect(
      organizationDraftFormSchema.parse({
        name: 'Ironroot Smiths',
        authoringPresetId: '',
        organizationDomain: 'commercial',
        practices: ['blacksmithing'],
      }),
    ).toMatchObject({ authoringPresetId: undefined })
  })

  it('reuses the canonical standalone fields under an embedded namespace', () => {
    const standalone = collectFields(buildOrganizationFields(makeContentFormCtx()))
    const embedded = collectFields(
      buildOrganizationFields(makeContentFormCtx(), {
        prefix: 'operatorOrganization',
        includeName: true,
      }),
    )

    expect(standalone.map(({ name }) => name)).toEqual([
      'authoringPresetId',
      'organizationDomain',
      'organizationForm',
      'functions',
      'practices',
      'description',
    ])
    expect(embedded.map(({ name }) => name)).toEqual([
      'operatorOrganization.name',
      'operatorOrganization.authoringPresetId',
      'operatorOrganization.organizationDomain',
      'operatorOrganization.organizationForm',
      'operatorOrganization.functions',
      'operatorOrganization.practices',
      'operatorOrganization.description',
    ])
    const standaloneFunctions = standalone.find(({ name }) => name === 'functions')?.item
    const embeddedFunctions = embedded.find(({ name }) => name.endsWith('functions'))?.item
    expect(embeddedFunctions).toMatchObject({
      type: 'chips',
      label: 'Functions',
      hint: { text: 'What this organization broadly does.', position: 'below-control' },
      chrome: { variant: 'outline' },
      options:
        standaloneFunctions && 'options' in standaloneFunctions ? standaloneFunctions.options : [],
      multiple: true,
    })
    const standalonePractices = standalone.find(({ name }) => name === 'practices')?.item
    const embeddedPractices = embedded.find(({ name }) => name.endsWith('practices'))?.item
    expect(embeddedPractices).toMatchObject({
      type: 'combobox',
      label: 'Practices',
      hint: {
        text: 'Distinctive trades, methods, or operational specialties.',
        position: 'below-control',
      },
      options:
        standalonePractices && 'options' in standalonePractices ? standalonePractices.options : [],
      multiple: true,
    })
  })

  it('uses browse chips for functions and a searchable combobox for practices', () => {
    const fields = collectFields(buildOrganizationFields(makeContentFormCtx()))
    const practicePlaceholder = vocabularyTermFieldCopy(ORGANIZATION_PRACTICE_TERM, {
      multiple: true,
    }).placeholder

    expect(fields.find(({ name }) => name === 'functions')?.item).toMatchObject({
      type: 'chips',
      label: 'Functions',
      hint: { text: 'What this organization broadly does.', position: 'below-control' },
      chrome: { variant: 'outline' },
      multiple: true,
    })
    const practicesField = fields.find(({ name }) => name === 'practices')?.item
    expect(practicesField).toMatchObject({
      type: 'combobox',
      label: 'Practices',
      hint: {
        text: 'Distinctive trades, methods, or operational specialties.',
        position: 'below-control',
      },
      placeholder: practicePlaceholder,
      multiple: true,
    })

    const practiceOptions =
      practicesField && 'options' in practicesField && Array.isArray(practicesField.options)
        ? flattenSelectFieldOptions(practicesField.options)
        : []
    const brewing = practiceOptions.find((option) => option.value === 'brewing')
    expect(brewing?.searchTerms).toEqual(expect.arrayContaining(['ale', 'beer']))
    expect(optionMatchesQuery(brewing!, 'ale')).toBe(true)

    const shipbuilding = practiceOptions.find((option) => option.value === 'shipbuilding')
    expect(optionMatchesQuery(shipbuilding!, 'shipwright')).toBe(true)

    const fencing = practiceOptions.find((option) => option.value === 'fencing')
    expect(fencing?.searchTerms).toEqual(
      expect.arrayContaining(['stolen-goods fencing', 'fence network']),
    )
    expect(optionMatchesQuery(fencing!, 'stolen goods')).toBe(true)
  })

  it('uses a searchable single-select combobox for familiar starting points', () => {
    const fields = collectFields(buildOrganizationFields(makeContentFormCtx()))
    const presetField = fields.find(({ name }) => name === 'authoringPresetId')?.item
    expect(presetField).toMatchObject({
      type: 'combobox',
      label: 'Start from familiar type',
      multiple: false,
      placeholder: 'Search familiar types…',
    })

    const options = presetPickerOptions(fields)
    expect(options).toHaveLength(50)

    const army = options.find((option) => option.value === 'army')
    expect(army).toMatchObject({
      label: 'Army',
      description: expect.stringContaining('marines'),
      searchTerms: expect.arrayContaining(['marines', 'garrison', 'legion']),
    })
    expect(optionMatchesQuery(army!, 'navy')).toBe(false)
    expect(optionMatchesQuery(army!, 'militia')).toBe(false)

    const navy = options.find((option) => option.value === 'navy')
    expect(optionMatchesQuery(navy!, 'navy')).toBe(true)

    const church = options.find((option) => option.value === 'church')
    expect(optionMatchesQuery(church!, 'temple')).toBe(true)

    const academy = options.find((option) => option.value === 'academy')
    expect(optionMatchesQuery(academy!, 'university')).toBe(false)

    const university = options.find((option) => option.value === 'university')
    expect(optionMatchesQuery(university!, 'university')).toBe(true)

    const tradingCompany = options.find((option) => option.value === 'trading_company')
    expect(optionMatchesQuery(tradingCompany!, 'merchant house')).toBe(false)

    const merchantHouse = options.find((option) => option.value === 'merchant_house')
    expect(optionMatchesQuery(merchantHouse!, 'merchant house')).toBe(true)
    expect(optionMatchesQuery(tradingCompany!, 'shipping')).toBe(false)

    const shippingCompany = options.find((option) => option.value === 'shipping_company')
    expect(shippingCompany).toMatchObject({
      label: 'Shipping company',
      searchTerms: expect.arrayContaining(['coach line', 'courier service']),
    })
    expect(optionMatchesQuery(shippingCompany!, 'caravan company')).toBe(false)

    const caravanCompany = options.find((option) => option.value === 'caravan_company')
    expect(optionMatchesQuery(caravanCompany!, 'caravan company')).toBe(true)
    expect(optionMatchesQuery(shippingCompany!, 'shipping')).toBe(true)
  })

  it('uses one input builder for standalone and embedded function/practice values', () => {
    expect(
      buildOrganizationCreateInput({
        name: 'Red Dragon Brewing Company',
        organizationDomain: 'commercial',
        organizationForm: 'company',
        practices: ['brewing'],
        functions: [],
      }),
    ).toMatchObject({
      name: 'Red Dragon Brewing Company',
      organizationDomain: 'commercial',
      organizationForm: 'company',
      practices: ['brewing'],
    })
  })

  it('never serializes ephemeral preset identity', () => {
    const input = buildOrganizationCreateInput({
      name: 'Night Market Ring',
      authoringPresetId: 'smuggling_ring',
      organizationDomain: 'political',
      organizationForm: 'network',
      practices: ['smuggling'],
      functions: [],
    })
    expect(input).not.toHaveProperty('authoringPresetId')
    expect(input.organizationDomain).toBe('political')
  })

  it('applies an ephemeral preset equally under an embedded namespace', () => {
    const [sync] = buildOrganizationFormValueSyncs('operatorOrganization')
    expect(
      sync?.apply({ 'operatorOrganization.authoringPresetId': 'smuggling_ring' }, [
        'operatorOrganization.authoringPresetId',
      ]),
    ).toEqual({
      'operatorOrganization.authoringPresetId': undefined,
      'operatorOrganization.organizationDomain': 'criminal',
      'operatorOrganization.organizationForm': 'network',
      'operatorOrganization.functions': [],
      'operatorOrganization.practices': ['smuggling'],
    })
  })
})
