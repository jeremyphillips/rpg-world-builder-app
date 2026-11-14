import { describe, expect, it } from 'vitest'

import type { SelectFieldConfig } from './choice-fields.types'
import { flattenSelectFieldOptions } from './field-options'
import {
  filterSelectFieldOptionList,
  isSelectFieldReadOnly,
  resolveSelectFieldDisplayLabel,
} from './select-field-options.lib'

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

  it('filters inside groups and drops an empty group', () => {
    expect(
      filterSelectFieldOptionList(
        [
          {
            kind: 'group',
            label: 'Kept',
            options: [
              { value: 'full', label: 'Full effect' },
              { value: 'half', label: 'Half effect' },
            ],
          },
          {
            kind: 'group',
            label: 'Removed',
            options: [{ value: 'none', label: 'None' }],
          },
        ],
        (options) => options.filter((option) => option.value !== 'none' && option.value !== 'half'),
      ),
    ).toEqual([
      {
        kind: 'group',
        label: 'Kept',
        options: [{ value: 'full', label: 'Full effect' }],
      },
    ])
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
