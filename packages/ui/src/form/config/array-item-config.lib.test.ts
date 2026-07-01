import { describe, expect, it } from 'vitest'

import type { FormItem } from '../field-config'
import { isNestedArraySection, resolveArrayItemVariant } from './array-item-config.lib'

describe('array-item-config.lib', () => {
  it('treats nested array sections as compact', () => {
    expect(isNestedArraySection(2)).toBe(true)
    expect(
      resolveArrayItemVariant(
        {
          kind: 'array',
          name: 'tags',
          legend: 'Tags',
          fields: [{ type: 'text', name: 'label', label: 'Label' }],
        },
        { nested: true },
      ),
    ).toBe('compact')
  })

  it('auto-selects compact for a single leaf row', () => {
    const config = {
      kind: 'array' as const,
      name: 'utilizes',
      legend: 'Utilize actions',
      fields: [
        {
          kind: 'row' as const,
          fields: [
            { type: 'text' as const, name: 'description', label: 'Description', required: true },
            { type: 'number' as const, name: 'dc', label: 'DC', min: 1, required: true },
          ],
        },
      ],
    }

    expect(resolveArrayItemVariant(config, { nested: false })).toBe('compact')
  })

  it('auto-selects detailed for multi-field items', () => {
    const config = {
      kind: 'array' as const,
      name: 'traits',
      legend: 'Traits',
      fields: [
        { type: 'text' as const, name: 'name', label: 'Name', required: true },
        { type: 'textarea' as const, name: 'description', label: 'Description' },
      ] satisfies FormItem[],
    }

    expect(resolveArrayItemVariant(config, { nested: false })).toBe('detailed')
  })
})
