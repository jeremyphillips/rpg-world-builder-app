import { describe, expect, it } from 'vitest'

import {
  flattenSelectFieldOptions,
  isSelectFieldReadOnly,
  resolveSelectFieldDisplayLabel,
  type SelectFieldConfig,
} from './field-config'

describe('select read-only helpers', () => {
  const baseConfig = {
    type: 'select',
    name: 'amount',
    label: 'Amount',
    options: [
      { value: 'full', label: 'Full effect' },
      { value: 'half', label: 'Half effect' },
    ],
  } satisfies SelectFieldConfig

  it('flattens grouped options', () => {
    expect(
      flattenSelectFieldOptions([
        {
          kind: 'group',
          label: 'Amounts',
          options: [{ value: 'full', label: 'Full effect' }],
        },
      ]),
    ).toEqual([{ value: 'full', label: 'Full effect' }])
  })

  it('detects read-only presentation from resolved options', () => {
    const config: SelectFieldConfig = {
      ...baseConfig,
      presentation: {
        readOnlyWhen: ({ options }) => options.length === 1,
      },
    }

    expect(isSelectFieldReadOnly(config, [{ value: 'full', label: 'Full effect' }])).toBe(true)
    expect(isSelectFieldReadOnly(config, baseConfig.options)).toBe(false)
  })

  it('resolves display labels from value or sole option', () => {
    expect(resolveSelectFieldDisplayLabel('half', baseConfig.options)).toBe('Half effect')
    expect(
      resolveSelectFieldDisplayLabel(undefined, [{ value: 'full', label: 'Full effect' }]),
    ).toBe('Full effect')
  })
})
