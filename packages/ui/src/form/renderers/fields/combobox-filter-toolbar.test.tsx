import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ComboboxFilterToolbar } from './combobox-filter-toolbar.client'

describe('ComboboxFilterToolbar', () => {
  it('wraps each dimension select in an equal-width flex item', () => {
    const { container } = render(
      <ComboboxFilterToolbar
        dimensionConfigs={[
          {
            filterKey: 'category',
            ariaLabel: 'Filter by category',
            options: [{ value: 'simple', label: 'Simple' }],
          },
          {
            filterKey: 'mode',
            ariaLabel: 'Filter by mode',
            options: [{ value: 'melee', label: 'Melee' }],
          },
        ]}
        active={{}}
        onActiveChange={vi.fn()}
      />,
    )

    const row = container.firstElementChild
    expect(row).toHaveClass('ui-catalog-filter-controls', 'w-full')

    const items = row?.children
    expect(items).toHaveLength(2)
    expect(items?.[0]).toHaveClass('ui-combobox-filter-toolbar__item')
    expect(screen.getByRole('combobox', { name: 'Filter by category' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Filter by mode' })).toBeInTheDocument()
  })
})
