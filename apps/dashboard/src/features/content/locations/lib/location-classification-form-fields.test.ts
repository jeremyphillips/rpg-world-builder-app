import { describe, expect, it } from 'vitest'
import type { ComboboxFieldConfig, GroupConfig } from '@rpg/ui/form'

import {
  buildBuildingArchetypeFieldOptions,
  formatBuildingArchetypeOptionDescription,
  formatBuildingArchetypeTypicalUsesHint,
  formatBuildingFunctionOverrideHint,
} from './building-archetype-form-options'
import { buildLocationClassificationFields } from './location-classification-form-fields'

function fieldByName(name: string) {
  const field = buildLocationClassificationFields().find(
    (item) => !('kind' in item) && item.name === name,
  )
  if (!field) {
    throw new Error(`expected field ${name}`)
  }
  return field
}

function groupByLegend(legend: string): GroupConfig {
  const group = buildLocationClassificationFields().find(
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
  it('orders building fields as structure type, archetype, specialization, then advanced group', () => {
    const names = buildLocationClassificationFields().flatMap((item) => {
      if ('kind' in item && item.kind === 'group') {
        return 'legend' in item && item.legend === 'Advanced classification' ? [item.legend] : []
      }
      if ('kind' in item) {
        return []
      }
      return [item.name]
    })

    expect(names).toEqual([
      'classification.kind',
      'classification.type',
      'structureType',
      'classification.archetype',
      'classification.specialization',
      'Advanced classification',
      'interiorType',
      'classification.type',
    ])
  })

  it('wires the archetype combobox for buildings with typical-uses hint resolution', () => {
    const archetypeField = fieldByName('classification.archetype') as ComboboxFieldConfig
    expect(archetypeField).toMatchObject({
      type: 'combobox',
      multiple: false,
      placeholder: 'Search building archetypes…',
      visibility: {
        dependsOn: ['kind', 'structureType'],
      },
      hint: {
        resolve: {
          dependsOn: ['classification.archetype'],
        },
      },
    })
  })

  it('keeps advanced classification collapsed by default with override hint wiring', () => {
    const advancedGroup = groupByLegend('Advanced classification')
    expect(advancedGroup.disclosure).toEqual({ variant: 'legend', defaultOpen: false })
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
