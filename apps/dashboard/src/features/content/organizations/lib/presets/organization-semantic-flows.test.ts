import { describe, expect, it } from 'vitest'
import { optionMatchesQuery } from '@rpg/ui'
import {
  ORGANIZATION_AUTHORING_PRESET_IDS,
  ORGANIZATION_AUTHORING_PRESETS,
  applyOrganizationAuthoringPreset,
  getOrganizationAuthoringPresetRecommendedPractices,
} from '@rpg/contracts'
import type { FieldOption, FormItem } from '@rpg/ui/form'
import { flattenSelectFieldOptions } from '@rpg/ui/form'

import { makeContentFormCtx } from '../../../lib/fixtures/content-form-ctx'
import {
  buildOrganizationCreateInput,
  buildOrganizationFields,
  buildOrganizationFormValueSyncs,
  type OrganizationFormValues,
} from '../../../lib/forms/organization-form-projection'
import { presetMatchesIntentionalQuery } from './organization-preset-intentional-matcher'

function collectFields(items: readonly FormItem[]): Array<{ name: string; item: FormItem }> {
  const fields: Array<{ name: string; item: FormItem }> = []
  for (const item of items) {
    if ('name' in item && typeof item.name === 'string') fields.push({ name: item.name, item })
    if ('fields' in item && Array.isArray(item.fields)) fields.push(...collectFields(item.fields))
  }
  return fields
}

function practiceOptions(fields: ReturnType<typeof collectFields>): FieldOption[] {
  const practicesField = fields.find(({ name }) => name === 'practices')?.item
  if (!practicesField || !('options' in practicesField) || !Array.isArray(practicesField.options)) {
    return []
  }
  return flattenSelectFieldOptions(practicesField.options)
}

function authoringPresetComboboxOptions(): FieldOption[] {
  return ORGANIZATION_AUTHORING_PRESET_IDS.map((id) => {
    const preset = ORGANIZATION_AUTHORING_PRESETS[id]
    return {
      value: id,
      label: preset.label,
      metadata: preset.description,
      ...('discoveryTerms' in preset && preset.discoveryTerms
        ? { searchTerms: preset.discoveryTerms }
        : {}),
    }
  })
}

describe('initial Organization semantic flows', () => {
  it.each(ORGANIZATION_AUTHORING_PRESET_IDS)(
    'applies %s identically in standalone and embedded authoring',
    (presetId) => {
      const recipe = ORGANIZATION_AUTHORING_PRESETS[presetId]
      const standalone = buildOrganizationFormValueSyncs()[0]!.apply(
        { startingPointId: presetId },
        ['startingPointId'],
      )!
      const embedded = buildOrganizationFormValueSyncs('operatorOrganization')[0]!.apply(
        { 'operatorOrganization.startingPointId': presetId },
        ['operatorOrganization.startingPointId'],
      )!

      const standaloneTitles = standalone['members.titles']
      const embeddedTitles = embedded['operatorOrganization.members.titles']
      const standaloneWithoutTitles = { ...standalone }
      const embeddedWithoutTitles = { ...embedded }
      delete standaloneWithoutTitles['members.titles']
      delete embeddedWithoutTitles['operatorOrganization.members.titles']

      expect(embeddedWithoutTitles).toEqual(
        Object.fromEntries(
          Object.entries(standaloneWithoutTitles).map(([key, value]) => [
            `operatorOrganization.${key}`,
            value,
          ]),
        ),
      )
      expect(Array.isArray(standaloneTitles)).toBe(true)
      expect(Array.isArray(embeddedTitles)).toBe(true)
      expect((embeddedTitles as unknown[]).length).toBe((standaloneTitles as unknown[]).length)

      const input = buildOrganizationCreateInput({
        name: recipe.label,
        startingPointId: presetId,
        organizationDomain:
          standalone.organizationDomain as OrganizationFormValues['organizationDomain'],
        organizationForm: standalone.organizationForm as OrganizationFormValues['organizationForm'],
        functions: (standalone.functions ?? []) as OrganizationFormValues['functions'],
        practices: (standalone.practices ?? []) as OrganizationFormValues['practices'],
        members: {
          classAffinityIds: (standalone['members.classAffinityIds'] ?? []) as string[],
          speciesAffinityIds: [],
          titles: (standalone['members.titles'] ??
            []) as OrganizationFormValues['members']['titles'],
        },
      })
      expect(input).not.toHaveProperty('startingPointId')
      expect(input).not.toHaveProperty('sourcePresetId')
      expect((input.members.titles ?? []).length).toBeGreaterThan(0)
    },
  )

  it('does not seed name when applying a familiar starting point', () => {
    const [sync] = buildOrganizationFormValueSyncs()
    const applied = sync?.apply({ name: 'Royal Navy', startingPointId: 'army' }, [
      'startingPointId',
    ])

    expect(applied).toMatchObject({
      startingPointId: 'army',
      organizationDomain: 'military',
      organizationForm: 'force',
      functions: ['warfare', 'defense'],
      practices: [],
      'members.classAffinityIds': [],
      'members.titles': expect.any(Array),
    })
    expect(applied).not.toHaveProperty('name')
  })

  it('reopens canonical Smuggling ring values without reconstructing preset identity', () => {
    const input = buildOrganizationCreateInput({
      name: 'Dockside Exchange',
      organizationDomain: 'criminal',
      organizationForm: 'network',
      practices: ['smuggling'],
      functions: [],
      members: { classAffinityIds: [], speciesAffinityIds: [] },
    })
    expect(input).toMatchObject({
      organizationDomain: 'criminal',
      organizationForm: 'network',
      practices: ['smuggling'],
    })
    expect(input).not.toHaveProperty('type')
    expect(input).not.toHaveProperty('startingPointId')
  })

  it('projects breadth presets for protection racket, assassins, and shipyard flows', () => {
    expect(applyOrganizationAuthoringPreset('protection_racket')).toMatchObject({
      organizationDomain: 'criminal',
      organizationForm: 'network',
      practices: ['extortion'],
    })
    expect(applyOrganizationAuthoringPreset('assassins_order')).toMatchObject({
      organizationDomain: 'criminal',
      organizationForm: 'order',
      practices: ['assassination'],
    })
    expect(applyOrganizationAuthoringPreset('shipyard')).toMatchObject({
      organizationDomain: 'commercial',
      organizationForm: 'company',
      functions: ['production'],
      practices: ['shipbuilding'],
    })
    expect(applyOrganizationAuthoringPreset('navy')).toMatchObject({
      organizationDomain: 'military',
      organizationForm: 'force',
      functions: ['warfare', 'defense'],
      practices: ['navigation'],
    })
    expect(applyOrganizationAuthoringPreset('university')).toMatchObject({
      organizationDomain: 'academic',
      organizationForm: 'association',
      functions: ['education', 'training', 'research'],
      practices: [],
    })
    expect(applyOrganizationAuthoringPreset('fencing_network')).toMatchObject({
      organizationDomain: 'criminal',
      organizationForm: 'network',
      practices: ['fencing'],
    })
  })

  it('routes breadth practice searches to the admitted ids', () => {
    const fields = collectFields(buildOrganizationFields(makeContentFormCtx()))
    const options = practiceOptions(fields)

    const shipbuilding = options.find((option) => option.value === 'shipbuilding')
    expect(optionMatchesQuery(shipbuilding!, 'shipwright')).toBe(true)

    const fencing = options.find((option) => option.value === 'fencing')
    expect(optionMatchesQuery(fencing!, 'fence')).toBe(true)
    expect(optionMatchesQuery(fencing!, 'stolen goods')).toBe(true)

    const investigation = options.find((option) => option.value === 'investigation')
    expect(optionMatchesQuery(investigation!, 'detective')).toBe(true)

    const tracking = options.find((option) => option.value === 'tracking')
    expect(optionMatchesQuery(tracking!, 'trails')).toBe(true)

    const cobbling = options.find((option) => option.value === 'cobbling')
    expect(optionMatchesQuery(cobbling!, 'shoemaking')).toBe(true)

    const alchemy = options.find((option) => option.value === 'alchemy')
    expect(optionMatchesQuery(alchemy!, 'potion making')).toBe(true)
    expect(options.some((option) => option.value === 'potion_making')).toBe(false)
  })

  it('routes breadth familiar-type searches away from generic parents', () => {
    collectFields(buildOrganizationFields(makeContentFormCtx()))
    const options = authoringPresetComboboxOptions()

    const army = options.find((option) => option.value === 'army')
    const navy = options.find((option) => option.value === 'navy')
    expect(optionMatchesQuery(army!, 'navy')).toBe(false)
    expect(optionMatchesQuery(navy!, 'navy')).toBe(true)
    expect(presetMatchesIntentionalQuery('navy', ORGANIZATION_AUTHORING_PRESETS.navy, 'Navy')).toBe(
      true,
    )
    expect(presetMatchesIntentionalQuery('army', ORGANIZATION_AUTHORING_PRESETS.army, 'Navy')).toBe(
      false,
    )

    const academy = options.find((option) => option.value === 'academy')
    const university = options.find((option) => option.value === 'university')
    expect(optionMatchesQuery(academy!, 'university')).toBe(false)
    expect(optionMatchesQuery(university!, 'university')).toBe(true)

    const gang = options.find((option) => option.value === 'gang')
    const protectionRacket = options.find((option) => option.value === 'protection_racket')
    expect(optionMatchesQuery(gang!, 'protection racket')).toBe(false)
    expect(optionMatchesQuery(protectionRacket!, 'protection racket')).toBe(true)

    const assassinsOrder = options.find((option) => option.value === 'assassins_order')
    expect(optionMatchesQuery(assassinsOrder!, "assassins' order")).toBe(true)
  })

  it('boosts thieves guild recommendations in the empty-query practices panel', () => {
    const recommendedPracticeIds =
      getOrganizationAuthoringPresetRecommendedPractices('thieves_guild')

    const fields = collectFields(
      buildOrganizationFields(makeContentFormCtx(), { recommendedPracticeIds }),
    )
    const practicesField = fields.find(({ name }) => name === 'practices')?.item
    expect(practicesField && 'resolveFilteredOptions' in practicesField).toBe(true)

    const ordered =
      practicesField &&
      'resolveFilteredOptions' in practicesField &&
      typeof practicesField.resolveFilteredOptions === 'function' &&
      'options' in practicesField &&
      Array.isArray(practicesField.options)
        ? practicesField.resolveFilteredOptions(practicesField.options, '', ['theft'])
        : []

    expect(ordered.slice(1, 5).map((option) => option.value)).toEqual([
      'fencing',
      'extortion',
      'smuggling',
      'investigation',
    ])
  })
})
