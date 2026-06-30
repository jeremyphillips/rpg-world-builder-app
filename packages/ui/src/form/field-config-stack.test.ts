import { describe, expect, it } from 'vitest'

import {
  buildDefaultValues,
  flattenFields,
  isContainer,
  type StackConfig,
} from './field-config'

describe('StackConfig helpers', () => {
  const stack: StackConfig = {
    kind: 'stack',
    layout: 'toggleDependent',
    dependentsChrome: 'subtle',
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
