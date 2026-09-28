import { describe, expect, it } from 'vitest'
import { optionMatchesQuery } from '@rpg/ui'
import {
  ORGANIZATION_AUTHORING_PRESET_IDS,
  ORGANIZATION_PRACTICE_TERM,
  vocabularyTermFieldCopy,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'
import { flattenSelectFieldOptions } from '@rpg/ui/form'

import { makeContentFormCtx } from '../fixtures/content-form-ctx'
import { snapshotOrganizationMembershipTitlesFromPreset } from '@rpg/contracts'

import {
  buildOrganizationCreateInput,
  buildOrganizationFields,
  buildOrganizationFormValueSyncs,
  organizationDraftFormSchema,
} from './organization-form-projection'
import { buildOrganizationStartingPointValueSyncPatch } from '../../organizations/lib/presets/organization-starting-point.lib'

function collectFields(items: readonly FormItem[]): Array<{ name: string; item: FormItem }> {
  const fields: Array<{ name: string; item: FormItem }> = []
  for (const item of items) {
    if ('name' in item && typeof item.name === 'string') fields.push({ name: item.name, item })
    if ('fields' in item && Array.isArray(item.fields)) fields.push(...collectFields(item.fields))
  }
  return fields
}

describe('organization form projection', () => {
  it('accepts the blank sentinel from an untouched authoring preset picker', () => {
    expect(
      organizationDraftFormSchema.parse({
        name: 'Ironroot Smiths',
        startingPointId: '',
        organizationDomain: 'commercial',
        practices: ['blacksmithing'],
      }),
    ).toMatchObject({ startingPointId: undefined })
  })

  it('omits the starting point slot on edit and exposes apply familiar type', () => {
    const fields = collectFields(buildOrganizationFields(makeContentFormCtx({ mode: 'edit' })))
    expect(fields.map(({ name }) => name)).not.toContain('startingPointId')
    expect(fields.map(({ name }) => name)).toContain('_organizationApplyFamiliarType')
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
      'startingPointId',
      'organizationDomain',
      'organizationForm',
      'functions',
      'practices',
      'members.classAffinityIds',
      'members.speciesAffinityIds',
      'description',
    ])
    expect(embedded.map(({ name }) => name)).toEqual([
      'operatorOrganization.name',
      'operatorOrganization.startingPointId',
      'operatorOrganization.organizationDomain',
      'operatorOrganization.organizationForm',
      'operatorOrganization.functions',
      'operatorOrganization.practices',
      'operatorOrganization.members.classAffinityIds',
      'operatorOrganization.members.speciesAffinityIds',
      'operatorOrganization.description',
    ])
    const standaloneFunctions = standalone.find(({ name }) => name === 'functions')?.item
    const embeddedFunctions = embedded.find(({ name }) => name.endsWith('functions'))?.item
    expect(embeddedFunctions).toMatchObject({
      type: 'chips',
      label: 'Functions',
      hint: { text: 'What the organization primarily does.', position: 'below-control' },
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
        text: 'Distinctive methods, trades, or operational specialties.',
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
      hint: { text: 'What the organization primarily does.', position: 'below-control' },
      multiple: true,
    })
    const practicesField = fields.find(({ name }) => name === 'practices')?.item
    expect(practicesField).toMatchObject({
      type: 'combobox',
      label: 'Practices',
      hint: {
        text: 'Distinctive methods, trades, or operational specialties.',
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

  it('registers a starting point slot and clearable optional form select', () => {
    const fields = collectFields(buildOrganizationFields(makeContentFormCtx()))
    expect(fields.find(({ name }) => name === 'startingPointId')?.item).toMatchObject({
      kind: 'slot',
    })
    expect(fields.find(({ name }) => name === 'organizationForm')?.item).toMatchObject({
      type: 'select',
      clearable: true,
      clearAccessibleName: 'Clear Form',
    })
    expect(ORGANIZATION_AUTHORING_PRESET_IDS).toHaveLength(50)
  })

  it('nests member affinities under collapsed Optional details for quick create', () => {
    const quick = buildOrganizationFields(makeContentFormCtx(), { presentation: 'quick' })
    const groups = quick.filter(
      (item): item is Extract<FormItem, { kind: 'group' }> =>
        'kind' in item && item.kind === 'group',
    )
    const optionalDetails = groups.find(
      (group) => group.heading?.label === 'Optional details' || group.legend === 'Optional details',
    )
    expect(optionalDetails).toMatchObject({
      disclosure: { variant: 'legend', defaultOpen: false },
      heading: {
        label: 'Optional details',
        hint: 'Member affinities and description',
      },
    })
    const nested = optionalDetails?.fields.find(
      (field): field is Extract<FormItem, { kind: 'group' }> =>
        'kind' in field && field.kind === 'group',
    )
    expect(nested).toMatchObject({
      legend: 'Member affinities',
      description: 'Used to suggest suitable options when adding or creating members.',
    })
  })

  it('uses one input builder for standalone and embedded function/practice values', () => {
    expect(
      buildOrganizationCreateInput({
        name: 'Red Dragon Brewing Company',
        organizationDomain: 'commercial',
        organizationForm: 'company',
        practices: ['brewing'],
        functions: [],
        members: { classAffinityIds: [], speciesAffinityIds: [], titles: [] },
      }),
    ).toMatchObject({
      name: 'Red Dragon Brewing Company',
      organizationDomain: 'commercial',
      organizationForm: 'company',
      practices: ['brewing'],
    })
  })

  it('serializes materialized membership titles and omits draft startingPointId', () => {
    let titleId = 0
    const titles = snapshotOrganizationMembershipTitlesFromPreset(
      'smuggling_ring',
      () => `fixed-${++titleId}`,
    )
    const input = buildOrganizationCreateInput({
      name: 'Night Market Ring',
      startingPointId: 'smuggling_ring',
      organizationDomain: 'criminal',
      organizationForm: 'network',
      practices: ['smuggling'],
      functions: [],
      members: { classAffinityIds: [], speciesAffinityIds: [], titles },
    })
    expect(input).not.toHaveProperty('startingPointId')
    expect(input).not.toHaveProperty('sourcePresetId')
    expect(input.members.titles).toHaveLength(titles.length)
    expect(input.organizationDomain).toBe('criminal')
  })

  it('materializes preset values under an embedded namespace while keeping startingPointId', () => {
    expect(
      buildOrganizationStartingPointValueSyncPatch('smuggling_ring', {
        prefix: 'operatorOrganization',
        discoverableClasses: [],
      }),
    ).toMatchObject({
      'operatorOrganization.startingPointId': 'smuggling_ring',
      'operatorOrganization.organizationDomain': 'criminal',
      'operatorOrganization.organizationForm': 'network',
      'operatorOrganization.functions': [],
      'operatorOrganization.practices': ['smuggling'],
      'operatorOrganization.members.classAffinityIds': [],
    })
  })

  it('seeds member class affinity ids from discoverable classes when applying a familiar type', () => {
    const fighter = {
      id: 'class-fighter',
      slug: 'fighter',
      name: 'Fighter',
    }
    const paladin = {
      id: 'class-paladin',
      slug: 'paladin',
      name: 'Paladin',
    }
    const discoverable = [fighter, paladin]
    const [sync] = buildOrganizationFormValueSyncs(undefined, discoverable as never)
    expect(sync?.apply({ startingPointId: 'knightly_order' }, ['startingPointId'])).toMatchObject({
      startingPointId: 'knightly_order',
      organizationDomain: 'military',
      organizationForm: 'order',
      functions: ['warfare', 'defense'],
      practices: [],
      'members.classAffinityIds': ['class-fighter', 'class-paladin'],
      'members.titles': expect.any(Array),
    })
  })

  it('skips unavailable preset slugs when seeding member class affinity ids', () => {
    const fighter = {
      id: 'class-fighter',
      slug: 'fighter',
      name: 'Fighter',
    }
    const [sync] = buildOrganizationFormValueSyncs(undefined, [fighter] as never)
    expect(sync?.apply({ startingPointId: 'knightly_order' }, ['startingPointId'])).toMatchObject({
      'members.classAffinityIds': ['class-fighter'],
    })
  })

  it('replaces member class affinity ids when switching familiar types', () => {
    const classes = [
      { id: 'class-fighter', slug: 'fighter', name: 'Fighter' },
      { id: 'class-barbarian', slug: 'barbarian', name: 'Barbarian' },
      { id: 'class-ranger', slug: 'ranger', name: 'Ranger' },
      { id: 'class-rogue', slug: 'rogue', name: 'Rogue' },
    ]
    const [sync] = buildOrganizationFormValueSyncs(undefined, classes as never)
    const thievesGuild = sync?.apply({ startingPointId: 'thieves_guild' }, ['startingPointId'])
    expect(thievesGuild?.['members.classAffinityIds']).toEqual(['class-rogue'])

    const mercenary = sync?.apply({ startingPointId: 'mercenary_company' }, ['startingPointId'])
    expect(mercenary?.['members.classAffinityIds']).toEqual([
      'class-fighter',
      'class-barbarian',
      'class-ranger',
    ])
  })

  it('updates startingPointId when switching familiar starting points', () => {
    const [sync] = buildOrganizationFormValueSyncs()
    const thievesGuild = sync?.apply({ startingPointId: 'thieves_guild' }, ['startingPointId'])
    expect(thievesGuild?.startingPointId).toBe('thieves_guild')

    const mercenary = sync?.apply({ startingPointId: 'mercenary_company' }, ['startingPointId'])
    expect(mercenary?.startingPointId).toBe('mercenary_company')
  })

  it('round-trips custom member class affinity ids through create input', () => {
    const input = buildOrganizationCreateInput({
      name: 'Free Company',
      organizationDomain: 'military',
      functions: [],
      practices: [],
      members: {
        classAffinityIds: ['class-fighter', 'class-barbarian', 'class-wizard'],
        speciesAffinityIds: [],
        titles: [],
      },
    })
    expect(input.members.classAffinityIds).toEqual([
      'class-fighter',
      'class-barbarian',
      'class-wizard',
    ])
  })
})
