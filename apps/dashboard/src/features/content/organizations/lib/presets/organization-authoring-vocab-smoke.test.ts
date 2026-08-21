import { describe, expect, it } from 'vitest'
import {
  ORGANIZATION_FORM_IDS,
  ORGANIZATION_FUNCTION_IDS,
  ORGANIZATION_PRACTICE_IDS,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'
import { flattenSelectFieldOptions } from '@rpg/ui/form'

import { makeContentFormCtx } from '../../../lib/fixtures/content-form-ctx'
import {
  buildOrganizationCreateInput,
  buildOrganizationFields,
  buildOrganizationFormValueSyncs,
  organizationToFormValues,
  type OrganizationFormValues,
} from '../../../lib/forms/organization-form-projection'
import { organizationsFilterSchema } from '../organizations-overview-columns'

const PASS_A_FORMS = ['force', 'office'] as const
const PASS_A_FUNCTIONS = ['trade', 'production', 'transport', 'administration'] as const

function collectFields(items: readonly FormItem[]): Array<{ name: string; item: FormItem }> {
  const fields: Array<{ name: string; item: FormItem }> = []
  for (const item of items) {
    if ('name' in item && typeof item.name === 'string') fields.push({ name: item.name, item })
    if ('fields' in item && Array.isArray(item.fields)) fields.push(...collectFields(item.fields))
  }
  return fields
}

function optionValues(field: FormItem | undefined): string[] {
  if (!field || !('options' in field) || !Array.isArray(field.options)) return []
  return flattenSelectFieldOptions(field.options).map((option) => option.value)
}

describe('organization authoring vocab smoke', () => {
  it('exposes Pass A forms and functions in standalone authoring fields', () => {
    const fields = collectFields(buildOrganizationFields(makeContentFormCtx()))
    const formOptions = optionValues(fields.find(({ name }) => name === 'organizationForm')?.item)
    const functionOptions = optionValues(fields.find(({ name }) => name === 'functions')?.item)
    const practiceOptions = optionValues(fields.find(({ name }) => name === 'practices')?.item)

    for (const id of PASS_A_FORMS) {
      expect(ORGANIZATION_FORM_IDS).toContain(id)
      expect(formOptions).toContain(id)
    }
    for (const id of PASS_A_FUNCTIONS) {
      expect(ORGANIZATION_FUNCTION_IDS).toContain(id)
      expect(functionOptions).toContain(id)
    }
    expect(ORGANIZATION_PRACTICE_IDS).toContain('extortion')
    expect(practiceOptions).toContain('extortion')
  })

  it('exposes the same Pass A options under the embedded building-org namespace', () => {
    const fields = collectFields(
      buildOrganizationFields(makeContentFormCtx(), {
        prefix: 'operatorOrganization',
        includeName: true,
      }),
    )
    const formOptions = optionValues(
      fields.find(({ name }) => name === 'operatorOrganization.organizationForm')?.item,
    )
    const functionOptions = optionValues(
      fields.find(({ name }) => name === 'operatorOrganization.functions')?.item,
    )

    for (const id of PASS_A_FORMS) expect(formOptions).toContain(id)
    for (const id of PASS_A_FUNCTIONS) expect(functionOptions).toContain(id)
  })

  it('projects the Bank preset to finance and banking in standalone and embedded syncs', () => {
    const standalone = buildOrganizationFormValueSyncs()[0]!.apply({ authoringPresetId: 'bank' }, [
      'authoringPresetId',
    ])
    const embedded = buildOrganizationFormValueSyncs('operatorOrganization')[0]!.apply(
      { 'operatorOrganization.authoringPresetId': 'bank' },
      ['operatorOrganization.authoringPresetId'],
    )

    expect(standalone).toMatchObject({
      authoringPresetId: undefined,
      sourcePresetId: 'bank',
      organizationDomain: 'commercial',
      organizationForm: 'company',
      functions: ['finance'],
      practices: ['banking'],
    })
    expect(embedded).toMatchObject({
      'operatorOrganization.authoringPresetId': undefined,
      'operatorOrganization.sourcePresetId': 'bank',
      'operatorOrganization.organizationDomain': 'commercial',
      'operatorOrganization.organizationForm': 'company',
      'operatorOrganization.functions': ['finance'],
      'operatorOrganization.practices': ['banking'],
    })
  })

  it('projects the Army preset to force in standalone and embedded syncs', () => {
    const standalone = buildOrganizationFormValueSyncs()[0]!.apply({ authoringPresetId: 'army' }, [
      'authoringPresetId',
    ])
    const embedded = buildOrganizationFormValueSyncs('operatorOrganization')[0]!.apply(
      { 'operatorOrganization.authoringPresetId': 'army' },
      ['operatorOrganization.authoringPresetId'],
    )

    expect(standalone).toMatchObject({
      authoringPresetId: undefined,
      sourcePresetId: 'army',
      organizationDomain: 'military',
      organizationForm: 'force',
      functions: ['warfare', 'defense'],
      practices: [],
    })
    expect(embedded).toMatchObject({
      'operatorOrganization.authoringPresetId': undefined,
      'operatorOrganization.sourcePresetId': 'army',
      'operatorOrganization.organizationDomain': 'military',
      'operatorOrganization.organizationForm': 'force',
      'operatorOrganization.functions': ['warfare', 'defense'],
      'operatorOrganization.practices': [],
    })
  })

  it('projects breadth presets through standalone and embedded syncs', () => {
    const standalone = buildOrganizationFormValueSyncs()[0]!.apply({ authoringPresetId: 'navy' }, [
      'authoringPresetId',
    ])
    const embedded = buildOrganizationFormValueSyncs('operatorOrganization')[0]!.apply(
      { 'operatorOrganization.authoringPresetId': 'navy' },
      ['operatorOrganization.authoringPresetId'],
    )

    expect(standalone).toMatchObject({
      authoringPresetId: undefined,
      sourcePresetId: 'navy',
      organizationDomain: 'military',
      organizationForm: 'force',
      functions: ['warfare', 'defense'],
      practices: ['navigation'],
    })
    expect(embedded).toMatchObject({
      'operatorOrganization.authoringPresetId': undefined,
      'operatorOrganization.sourcePresetId': 'navy',
      'operatorOrganization.organizationDomain': 'military',
      'operatorOrganization.organizationForm': 'force',
      'operatorOrganization.functions': ['warfare', 'defense'],
      'operatorOrganization.practices': ['navigation'],
    })
  })

  it('projects City watch to policing with investigation practice', () => {
    const applied = buildOrganizationFormValueSyncs()[0]!.apply(
      { authoringPresetId: 'city_watch' },
      ['authoringPresetId'],
    )
    expect(applied).toMatchObject({
      sourcePresetId: 'city_watch',
      organizationDomain: 'government',
      functions: ['policing'],
      practices: ['investigation'],
    })
  })

  it('projects Political party to advocacy', () => {
    const applied = buildOrganizationFormValueSyncs()[0]!.apply(
      { authoringPresetId: 'political_party' },
      ['authoringPresetId'],
    )
    expect(applied).toMatchObject({
      sourcePresetId: 'political_party',
      organizationDomain: 'political',
      organizationForm: 'association',
      functions: ['advocacy'],
      practices: [],
    })
  })

  it.each([
    {
      name: 'Realm Logistics',
      organizationDomain: 'commercial',
      organizationForm: 'company',
      functions: ['transport'],
      practices: [],
      members: { classAffinityIds: [], speciesAffinityIds: [] },
    },
    {
      name: 'Royal Exchequer',
      organizationDomain: 'government',
      organizationForm: 'office',
      functions: ['administration'],
      practices: [],
      members: { classAffinityIds: [], speciesAffinityIds: [] },
    },
    {
      name: 'Ironworking Consortium',
      organizationDomain: 'commercial',
      organizationForm: 'company',
      functions: ['production', 'trade'],
      practices: [],
      members: { classAffinityIds: [], speciesAffinityIds: [] },
    },
    {
      name: 'Royal Host',
      organizationDomain: 'military',
      organizationForm: 'force',
      functions: ['warfare', 'defense'],
      practices: [],
      members: { classAffinityIds: [], speciesAffinityIds: [] },
    },
  ] satisfies Array<OrganizationFormValues>)('persists $name without preset identity', (values) => {
    const input = buildOrganizationCreateInput(values)
    expect(input).not.toHaveProperty('authoringPresetId')
    expect(input).toMatchObject({
      name: values.name,
      organizationDomain: values.organizationDomain,
      organizationForm: values.organizationForm,
      functions: values.functions ?? [],
      practices: values.practices ?? [],
    })
  })

  it('persists extortion through canonical create input without preset wiring', () => {
    const input = buildOrganizationCreateInput({
      name: 'Dockside Protection',
      organizationDomain: 'criminal',
      practices: ['extortion'],
      functions: [],
      members: { classAffinityIds: [], speciesAffinityIds: [] },
    })
    expect(input.practices).toEqual(['extortion'])
    expect(input).not.toHaveProperty('authoringPresetId')
  })

  it('reopens saved canonical fields without reconstructing preset identity', () => {
    const saved = buildOrganizationCreateInput({
      name: 'Admiralty Office',
      organizationDomain: 'government',
      organizationForm: 'office',
      functions: ['administration', 'defense'],
      practices: [],
      members: { classAffinityIds: [], speciesAffinityIds: [] },
    })
    const reopened = organizationToFormValues({
      ...saved,
      id: 'org-admiralty',
      slug: 'admiralty-office',
      rulesetId: 'srd-cc-5.2.1',
      source: 'homebrew',
      status: 'published',
      campaignId: 'camp',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      members: { classAffinityIds: [], speciesAffinityIds: [], titles: saved.members.titles ?? [] },
      connections: { locations: [] },
    })

    expect(reopened).toMatchObject({
      name: 'Admiralty Office',
      organizationDomain: 'government',
      organizationForm: 'office',
      functions: ['administration', 'defense'],
    })
    expect(reopened).not.toHaveProperty('authoringPresetId')
  })

  it('keeps overview domain facet on organizationDomain', () => {
    const domainFilter = organizationsFilterSchema.fields.find(
      (field) => field.id === 'organizationDomain',
    )
    expect(domainFilter?.id).toBe('organizationDomain')
  })
})
