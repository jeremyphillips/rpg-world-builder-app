import { describe, expect, it } from 'vitest'
import type { FormItem } from '@rpg/ui/form'

import { makeContentFormCtx } from '../fixtures/content-form-ctx'
import {
  buildOrganizationCreateInput,
  buildOrganizationFields,
  buildOrganizationFormValueSyncs,
} from './organization-form-projection'

function collectFields(items: readonly FormItem[]): Array<{ name: string; item: FormItem }> {
  const fields: Array<{ name: string; item: FormItem }> = []
  for (const item of items) {
    if ('name' in item && typeof item.name === 'string') fields.push({ name: item.name, item })
    if ('fields' in item && Array.isArray(item.fields)) fields.push(...collectFields(item.fields))
  }
  return fields
}

describe('organization form projection', () => {
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
      'description',
      'organizationDomain',
      'organizationForm',
      'activities',
    ])
    expect(embedded.map(({ name }) => name)).toEqual([
      'operatorOrganization.name',
      'operatorOrganization.authoringPresetId',
      'operatorOrganization.description',
      'operatorOrganization.organizationDomain',
      'operatorOrganization.organizationForm',
      'operatorOrganization.activities',
    ])
    const standaloneActivity = standalone.find(({ name }) => name === 'activities')?.item
    const embeddedActivity = embedded.find(({ name }) => name.endsWith('activities'))?.item
    expect(embeddedActivity).toMatchObject({
      type: 'chips',
      label: 'Activities',
      options:
        standaloneActivity && 'options' in standaloneActivity ? standaloneActivity.options : [],
      multiple: true,
    })
  })

  it('uses one input builder for standalone and embedded activity values', () => {
    expect(
      buildOrganizationCreateInput({
        name: 'Red Dragon Brewing Company',
        organizationDomain: 'commercial',
        organizationForm: 'company',
        activities: ['brewing'],
      }),
    ).toMatchObject({
      name: 'Red Dragon Brewing Company',
      organizationDomain: 'commercial',
      organizationForm: 'company',
      activities: ['brewing'],
    })
  })

  it('never serializes ephemeral preset identity', () => {
    const input = buildOrganizationCreateInput({
      name: 'Night Market Ring',
      authoringPresetId: 'smuggling_ring',
      organizationDomain: 'political',
      organizationForm: 'network',
      activities: ['smuggling'],
    })
    expect(input).not.toHaveProperty('authoringPresetId')
    expect(input.organizationDomain).toBe('political')
  })

  it('applies an ephemeral preset equally under an embedded namespace', () => {
    const [sync] = buildOrganizationFormValueSyncs('operatorOrganization')
    expect(
      sync?.apply(
        { 'operatorOrganization.authoringPresetId': 'smuggling_ring' },
        ['operatorOrganization.authoringPresetId'],
      ),
    ).toEqual({
      'operatorOrganization.authoringPresetId': undefined,
      'operatorOrganization.organizationDomain': 'criminal',
      'operatorOrganization.organizationForm': 'network',
      'operatorOrganization.activities': ['smuggling'],
    })
  })
})
