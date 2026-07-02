import { describe, expect, it } from 'vitest'

import {
  buildDefaultValues,
  flattenFields,
  isContainer,
  resolveDependentsVisibility,
  type StackConfig,
} from './field-config'

describe('StackConfig helpers', () => {
  const stack: StackConfig = {
    kind: 'stack',
    layout: 'dependent',
    dependentsChrome: 'subtle',
    dependentsChromeScope: 'arrayItems',
    fields: [
      { type: 'switch', name: 'enabled', label: 'Enabled', defaultValue: false },
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
  }

  it('treats stack as a container', () => {
    expect(isContainer(stack)).toBe(true)
    expect(isContainer(stack.fields[0]!)).toBe(false)
  })

  it('flattens nested stack fields', () => {
    expect(flattenFields([stack]).map((field) => field.name)).toEqual(['enabled', 'score'])
  })

  it('builds default values from nested stack fields including arrays', () => {
    const stack: StackConfig = {
      kind: 'stack',
      layout: 'dependent',
      fields: [
        { type: 'switch', name: 'enabled', label: 'Enabled', defaultValue: false },
        {
          kind: 'array',
          name: 'items',
          legend: 'Items',
          fields: [{ type: 'text', name: 'label', label: 'Label' }],
        },
      ],
    }

    expect(buildDefaultValues([stack])).toEqual({
      enabled: false,
      items: [],
    })
  })

  it('builds default values from nested stack fields', () => {
    expect(buildDefaultValues([stack])).toEqual({
      enabled: false,
      score: undefined,
    })
  })

  it('flattens fields inside nested stacks within groups', () => {
    const nested: StackConfig = {
      kind: 'stack',
      fields: [
        { type: 'switch', name: 'inner', label: 'Inner' },
        {
          kind: 'stack',
          fields: [{ type: 'text', name: 'detail', label: 'Detail' }],
        },
      ],
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

  it('returns explicit dependentsVisibility when set', () => {
    const visibility = {
      dependsOn: ['mode'],
      visibleWhen: (values: Record<string, unknown>) => values.mode !== 'all',
    }
    expect(
      resolveDependentsVisibility({ dependentsVisibility: visibility }, selectController),
    ).toBe(visibility)
  })

  it('auto-gates on switch truthy when dependentsVisibility is omitted', () => {
    const resolved = resolveDependentsVisibility({}, switchController)
    expect(resolved).toEqual({
      dependsOn: ['enabled'],
      visibleWhen: expect.any(Function),
    })
    expect(resolved!.visibleWhen({ enabled: true })).toBe(true)
    expect(resolved!.visibleWhen({ enabled: false })).toBe(false)
  })

  it('returns null for non-switch controllers without explicit visibility', () => {
    expect(resolveDependentsVisibility({}, selectController)).toBeNull()
  })

  it('returns null when controller is undefined', () => {
    expect(resolveDependentsVisibility({}, undefined)).toBeNull()
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
