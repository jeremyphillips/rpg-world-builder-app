import { describe, expect, it } from 'vitest'

import type { FormItem } from '../field-config'
import {
  isNestedArraySection,
  joinArrayItemSummaryParts,
  resolveArrayItemHeaderLabels,
  resolveArrayItemVariant,
} from './array-item-config.lib'

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

  it('joins summary segments with the middle-dot separator', () => {
    expect(joinArrayItemSummaryParts(['Levels 5–10', 'Avg 637.5 GP', '2 grants'])).toBe(
      'Levels 5–10 · Avg 637.5 GP · 2 grants',
    )
  })

  it('omits fallback from the visible header title unless showFallbackInHeader is true', () => {
    const hiddenFallback = resolveArrayItemHeaderLabels(
      {
        fallback: (index) => `Trait ${index + 1}`,
        primaryField: 'name',
      },
      { name: 'Darkvision' },
      0,
      'Darkvision',
      'Traits',
    )

    expect(hiddenFallback.showFallbackInTitle).toBe(false)
    expect(hiddenFallback.ariaLabel).toBe('Traits · Darkvision')

    const visibleFallback = resolveArrayItemHeaderLabels(
      {
        fallback: (index) => `Trait ${index + 1}`,
        primaryField: 'name',
        showFallbackInHeader: true,
      },
      { name: 'Darkvision' },
      0,
      'Darkvision',
      'Traits',
    )

    expect(visibleFallback.showFallbackInTitle).toBe(true)
    expect(visibleFallback.ariaLabel).toBe('Darkvision · Trait 1')
  })
})
