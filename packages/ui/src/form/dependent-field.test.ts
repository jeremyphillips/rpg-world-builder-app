import { describe, expect, it } from 'vitest'

import {
  buildDefaultValues,
  flattenFields,
  isContainer,
  resolveDependentsVisibility,
  type DependentConfig,
} from './field-config'

describe('DependentConfig helpers', () => {
  const dependent: DependentConfig = {
    kind: 'dependent',
    controller: { type: 'switch', name: 'enabled', label: 'Enabled', defaultValue: false },
    dependents: {
      chrome: 'panel',
      panel: { surface: { emphasis: 'subtle' } },
      scope: 'arrayItems',
      fields: [
        {
          type: 'number',
          name: 'score',
          label: 'Score',
          labelPosition: 'settings',
          visibility: {
            dependsOn: ['enabled'],
            visibleWhen: (values) => values.enabled === true,
          },
        },
      ],
    },
  }

  it('treats dependent as a container', () => {
    expect(isContainer(dependent)).toBe(true)
    expect(isContainer(dependent.controller)).toBe(false)
  })

  it('flattens nested dependent fields', () => {
    expect(flattenFields([dependent]).map((field) => field.name)).toEqual(['enabled', 'score'])
  })

  it('builds default values from nested dependent fields including arrays', () => {
    const nestedDependent: DependentConfig = {
      kind: 'dependent',
      controller: { type: 'switch', name: 'enabled', label: 'Enabled', defaultValue: false },
      dependents: {
        fields: [
          {
            kind: 'array',
            name: 'items',
            legend: 'Items',
            fields: [{ type: 'text', name: 'label', label: 'Label' }],
          },
        ],
      },
    }

    expect(buildDefaultValues([nestedDependent])).toEqual({
      enabled: false,
      items: [],
    })
  })

  it('builds default values from nested dependent fields', () => {
    expect(buildDefaultValues([dependent])).toEqual({
      enabled: false,
      score: undefined,
    })
  })

  it('flattens fields inside nested groups within dependents', () => {
    const nested: DependentConfig = {
      kind: 'dependent',
      controller: { type: 'switch', name: 'inner', label: 'Inner' },
      dependents: {
        fields: [
          {
            kind: 'group',
            fields: [{ type: 'text', name: 'detail', label: 'Detail' }],
          },
        ],
      },
    }

    expect(flattenFields([nested]).map((field) => field.name)).toEqual(['inner', 'detail'])
  })
})

describe('resolveDependentsVisibility', () => {
  const switchController = {
    type: 'switch' as const,
    name: 'enabled',
    label: 'Enabled',
    defaultValue: false,
  }
  const selectController = {
    type: 'select' as const,
    name: 'mode',
    label: 'Mode',
    options: [{ label: 'All', value: 'all' }],
  }

  it('returns explicit dependents.visibility when set', () => {
    const visibility = {
      dependsOn: ['mode'],
      visibleWhen: (values: Record<string, unknown>) => values.mode !== 'all',
    }
    expect(
      resolveDependentsVisibility({ dependents: { visibility, fields: [] } }, selectController),
    ).toBe(visibility)
  })

  it('auto-gates on switch truthy when dependents.visibility is omitted', () => {
    const resolved = resolveDependentsVisibility({ dependents: { fields: [] } }, switchController)
    expect(resolved).toEqual({
      dependsOn: ['enabled'],
      visibleWhen: expect.any(Function),
    })
    expect(resolved!.visibleWhen({ enabled: true })).toBe(true)
    expect(resolved!.visibleWhen({ enabled: false })).toBe(false)
  })

  it('returns null for non-switch controllers without explicit visibility', () => {
    expect(resolveDependentsVisibility({ dependents: { fields: [] } }, selectController)).toBeNull()
  })

  it('returns null when controller is undefined', () => {
    expect(
      resolveDependentsVisibility({ dependents: { fields: [] } }, undefined as never),
    ).toBeNull()
  })
})

describe('RowConfig visibility', () => {
  it('allows optional visibility on rows', () => {
    const row = {
      kind: 'row' as const,
      visibility: {
        dependsOn: ['enabled'],
        visibleWhen: (values: Record<string, unknown>) => values.enabled === true,
      },
      fields: [{ type: 'text' as const, name: 'detail', label: 'Detail' }],
    }

    expect(flattenFields([row]).map((field) => field.name)).toEqual(['detail'])
  })
})
