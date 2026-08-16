import { describe, expect, it } from 'vitest'
import {
  ORGANIZATION_ACTIVITY_IDS,
  ORGANIZATION_FORM_IDS,
  resolveOrganizationMemberTitleSuggestions,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'
import { flattenSelectFieldOptions } from '@rpg/ui/form'

import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import {
  buildOrganizationCreateInput,
  buildOrganizationFields,
  buildOrganizationFormValueSyncs,
  organizationToFormValues,
  type OrganizationFormValues,
} from '../../lib/forms/organization-form-projection'
import { organizationsFilterSchema } from './organizations-overview-columns'

const PASS_A_FORMS = ['force', 'office'] as const
const PASS_A_ACTIVITIES = ['trade', 'production', 'transport', 'administration'] as const

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

describe('Pass A authoring smoke', () => {
  it('exposes Pass A forms and activities in standalone authoring fields', () => {
    const fields = collectFields(buildOrganizationFields(makeContentFormCtx()))
    const formOptions = optionValues(fields.find(({ name }) => name === 'organizationForm')?.item)
    const activityOptions = optionValues(fields.find(({ name }) => name === 'activities')?.item)

    for (const id of PASS_A_FORMS) {
      expect(ORGANIZATION_FORM_IDS).toContain(id)
      expect(formOptions).toContain(id)
    }
    for (const id of PASS_A_ACTIVITIES) {
      expect(ORGANIZATION_ACTIVITY_IDS).toContain(id)
      expect(activityOptions).toContain(id)
    }
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
    const activityOptions = optionValues(
      fields.find(({ name }) => name === 'operatorOrganization.activities')?.item,
    )

    for (const id of PASS_A_FORMS) expect(formOptions).toContain(id)
    for (const id of PASS_A_ACTIVITIES) expect(activityOptions).toContain(id)
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
      organizationDomain: 'military',
      organizationForm: 'force',
      activities: ['warfare', 'defense'],
    })
    expect(embedded).toMatchObject({
      'operatorOrganization.authoringPresetId': undefined,
      'operatorOrganization.organizationDomain': 'military',
      'operatorOrganization.organizationForm': 'force',
      'operatorOrganization.activities': ['warfare', 'defense'],
    })
  })

  it.each([
    {
      name: 'Realm Logistics',
      organizationDomain: 'commercial',
      organizationForm: 'company',
      activities: ['transport'],
    },
    {
      name: 'Royal Exchequer',
      organizationDomain: 'government',
      organizationForm: 'office',
      activities: ['administration'],
    },
    {
      name: 'Ironworking Consortium',
      organizationDomain: 'commercial',
      organizationForm: 'company',
      activities: ['production', 'trade'],
    },
    {
      name: 'Royal Host',
      organizationDomain: 'military',
      organizationForm: 'force',
      activities: ['warfare', 'defense'],
    },
  ] satisfies Array<OrganizationFormValues>)('persists $name without preset identity', (values) => {
    const input = buildOrganizationCreateInput(values)
    expect(input).not.toHaveProperty('authoringPresetId')
    expect(input).toMatchObject({
      name: values.name,
      organizationDomain: values.organizationDomain,
      organizationForm: values.organizationForm,
      activities: values.activities,
    })
  })

  it('reopens saved canonical fields without reconstructing preset identity', () => {
    const saved = buildOrganizationCreateInput({
      name: 'Admiralty Office',
      organizationDomain: 'government',
      organizationForm: 'office',
      activities: ['administration', 'defense'],
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
      connections: { locations: [] },
    })

    expect(reopened).toMatchObject({
      name: 'Admiralty Office',
      organizationDomain: 'government',
      organizationForm: 'office',
      activities: ['administration', 'defense'],
    })
    expect(reopened).not.toHaveProperty('authoringPresetId')
  })

  it('resolves member titles from activities before form and domain', () => {
    const ministryLabels = resolveOrganizationMemberTitleSuggestions({
      domain: 'government',
      form: 'office',
      activities: ['administration'],
    }).map((entry) => entry.label)

    expect(ministryLabels[0]).toBe('Registrar')
    expect(ministryLabels).not.toContain('High Priest')
    expect(ministryLabels).toContain('Chancellor')

    const forceLabels = resolveOrganizationMemberTitleSuggestions({
      domain: 'military',
      form: 'force',
      activities: ['warfare', 'defense'],
    }).map((entry) => entry.label)

    expect(forceLabels[0]).toBe('General')
    expect(forceLabels).toContain('Commander')
  })

  it('keeps overview domain facet on organizationDomain', () => {
    const domainFilter = organizationsFilterSchema.fields.find(
      (field) => field.id === 'organizationDomain',
    )
    expect(domainFilter?.id).toBe('organizationDomain')
  })
})
