import { describe, expect, it } from 'vitest'

import {
  collectFieldDynamicDependsOn,
  resolveComboboxFieldConfig,
  type ComboboxFieldConfig,
} from './field-config'

describe('resolveComboboxFieldConfig', () => {
  it('resolves dynamic filterSelects from watched form values', () => {
    const config: ComboboxFieldConfig = {
      type: 'combobox',
      name: 'parentLocationId',
      label: 'Parent location',
      options: [],
      filterSelectsResolve: {
        dependsOn: ['authoringType'],
        filterSelectsWhen: (values) => [
          {
            filterKey: 'kind',
            ariaLabel: 'Filter by kind',
            options:
              values.authoringType === 'region'
                ? [
                    { value: 'world', label: 'World' },
                    { value: 'region', label: 'Region' },
                  ]
                : [{ value: 'district', label: 'District' }],
            allOptionLabel: 'All kinds',
          },
        ],
      },
    }

    const resolved = resolveComboboxFieldConfig(config, { authoringType: 'region' })

    expect(resolved.filterSelects?.[0]?.options.map((option) => option.value)).toEqual([
      'world',
      'region',
    ])

    const buildingResolved = resolveComboboxFieldConfig(config, { authoringType: 'building' })
    expect(buildingResolved.filterSelects?.[0]?.options.map((option) => option.value)).toEqual([
      'district',
    ])
  })

  it('resolves dynamic options alongside filterSelects', () => {
    const config: ComboboxFieldConfig = {
      type: 'combobox',
      name: 'parentLocationId',
      label: 'Parent location',
      optionsResolve: {
        dependsOn: ['authoringType'],
        optionsWhen: (values) =>
          values.authoringType === 'building'
            ? [{ value: 'dock-ward', label: 'Dock Ward', filterValues: { kind: 'district' } }]
            : [],
      },
      filterSelectsResolve: {
        dependsOn: ['authoringType'],
        filterSelectsWhen: () => [
          {
            filterKey: 'kind',
            ariaLabel: 'Filter by kind',
            options: [{ value: 'district', label: 'District' }],
            allOptionLabel: 'All kinds',
          },
        ],
      },
    }

    const resolved = resolveComboboxFieldConfig(config, { authoringType: 'building' })

    expect(resolved.options).toHaveLength(1)
    expect(resolved.filterSelects?.[0]?.filterKey).toBe('kind')
    const [firstOption] = resolved.options ?? []
    expect(firstOption?.filterValues?.kind).toBe('district')
  })

  it('collects recommendationResolve dependsOn for combobox fields', () => {
    const config: ComboboxFieldConfig = {
      type: 'combobox',
      name: 'items',
      label: 'Items',
      options: [],
      recommendationResolve: {
        dependsOn: ['equipment', 'mode'],
        recommendationWhen: () => null,
      },
    }

    expect(collectFieldDynamicDependsOn(config)).toEqual(['equipment', 'mode'])
  })
})
