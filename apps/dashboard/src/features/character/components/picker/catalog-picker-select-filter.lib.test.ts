import { describe, expect, it } from 'vitest'

import { catalogPickerInlineSelectFilter } from './catalog-picker-select-filter.lib'

describe('catalogPickerInlineSelectFilter', () => {
  it('builds an inline required select filter field', () => {
    expect(
      catalogPickerInlineSelectFilter<{ category: string }, 'category'>({
        key: 'category',
        label: 'Category',
        ariaLabel: 'Filter by category',
        triggerAriaLabel: 'Equipment category',
        options: [
          { value: '__all__', label: 'All' },
          { value: 'weapon', label: 'Weapon' },
        ],
      }),
    ).toEqual({
      key: 'category',
      type: 'select',
      label: 'Category',
      ariaLabel: 'Filter by category',
      triggerAriaLabel: 'Equipment category',
      labelLayout: 'inline',
      options: [
        { value: '__all__', label: 'All' },
        { value: 'weapon', label: 'Weapon' },
      ],
      visible: undefined,
      required: true,
    })
  })
})
