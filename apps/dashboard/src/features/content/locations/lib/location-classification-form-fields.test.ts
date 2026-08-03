import { describe, expect, it } from 'vitest'
import type { ComboboxFieldConfig, GroupConfig, TextSuggestionsFieldConfig } from '@rpg/ui/form'

import {
  buildBuildingArchetypeFieldOptions,
  formatBuildingArchetypeOptionDescription,
  formatBuildingArchetypeTypicalUsesHint,
  formatBuildingFunctionOverrideHint,
} from './building-archetype-form-options'
import {
  buildLocationClassificationFields,
  buildLocationPrimaryClassificationFields,
} from './location-classification-form-fields'

type FormItemLike = ReturnType<typeof buildLocationClassificationFields>[number]

function fieldByName(items: FormItemLike[], name: string) {
  const field = items.find((item) => !('kind' in item) && item.name === name)
  if (!field) {
    throw new Error(`expected field ${name}`)
  }
  return field
}

function groupByLegend(items: FormItemLike[], legend: string): GroupConfig {
  const group = items.find(
    (item): item is GroupConfig =>
      'kind' in item && item.kind === 'group' && item.legend === legend,
  )
  if (!group) {
    throw new Error(`expected group ${legend}`)
  }
  return group
}

describe('building archetype form options', () => {
  it('includes manifestation context in option descriptions', () => {
    expect(formatBuildingArchetypeOptionDescription('caravanserai')).toBe(
      'Inn manifestation · Lodging · Retail',
    )
    expect(formatBuildingArchetypeOptionDescription('inn')).toBe('Lodging · Food & drink')
  })

  it('builds combobox options from the registry', () => {
    const caravanserai = buildBuildingArchetypeFieldOptions().find(
      (option) => option.value === 'caravanserai',
    )
    expect(caravanserai).toMatchObject({
      label: 'Caravanserai',
      description: 'Inn manifestation · Lodging · Retail',
    })
  })

  it('formats typical uses from function labels only', () => {
    expect(formatBuildingArchetypeTypicalUsesHint({ 'classification.archetype': 'inn' })).toBe(
      'Typical uses: Lodging · Food & drink',
    )
    expect(formatBuildingArchetypeTypicalUsesHint({})).toBeUndefined()
  })

  it('formats function override guidance with default functions', () => {
    expect(formatBuildingFunctionOverrideHint({ 'classification.archetype': 'temple' })).toBe(
      'Default functions: Worship. Only change this when this particular building serves a substantially different function than its archetype normally does.',
    )
  })
})

describe('buildLocationClassificationFields building UX', () => {
  it('keeps secondary fields after the primary classification row', () => {
    const primaryNames = buildLocationPrimaryClassificationFields().flatMap((item) => {
      if ('kind' in item) return []
      return [item.name]
    })
    const secondaryNames = buildLocationClassificationFields().flatMap((item) => {
      if ('kind' in item && item.kind === 'group') {
        return 'legend' in item && item.legend === 'Advanced classification' ? [item.legend] : []
      }
      if ('kind' in item) {
        return []
      }
      return [item.name]
    })

    expect(primaryNames).toEqual([
      'planeType',
      'classification.kind',
      'settlementType',
      'siteType',
      'classification.archetype',
      'interiorType',
    ])
    expect(secondaryNames).toEqual([
      'classification.type',
      'classification.specialization',
      'Advanced classification',
      'classification.type',
    ])
  })

  it('wires the archetype combobox for buildings with typical-uses hint resolution', () => {
    const archetypeField = fieldByName(
      buildLocationPrimaryClassificationFields(),
      'classification.archetype',
    ) as ComboboxFieldConfig
    expect(archetypeField).toMatchObject({
      type: 'combobox',
      multiple: false,
      placeholder: 'Search building archetypes…',
      visibility: {
        dependsOn: ['authoringType'],
      },
      hint: {
        resolve: {
          dependsOn: ['classification.archetype'],
        },
      },
    })
  })

  it('wires specialization as text-with-suggestions driven by archetype', () => {
    const specializationField = fieldByName(
      buildLocationClassificationFields(),
      'classification.specialization',
    ) as TextSuggestionsFieldConfig
    expect(specializationField).toMatchObject({
      type: 'textSuggestions',
      placeholder: 'Optional',
      visibility: {
        dependsOn: ['authoringType'],
      },
      suggestions: {
        dependsOn: ['classification.archetype'],
      },
    })
  })

  it('keeps advanced classification collapsed by default with override hint wiring', () => {
    const advancedGroup = groupByLegend(
      buildLocationClassificationFields(),
      'Advanced classification',
    )
    expect(advancedGroup.disclosure).toEqual({ variant: 'legend', defaultOpen: false })
    expect(advancedGroup.legendSize).toBe('subsection')
    expect(advancedGroup.fields[0]).toMatchObject({
      name: 'classification.functionOverride',
      placeholder: 'Use archetype defaults',
      hint: {
        resolve: {
          dependsOn: ['classification.archetype'],
        },
      },
    })
  })
})
