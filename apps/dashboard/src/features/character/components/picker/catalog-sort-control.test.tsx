import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CatalogSortControl } from './catalog-sort-control.client'
import { pickerSortOption } from './catalog-picker-sort-labels.lib'

describe('CatalogSortControl', () => {
  it('shows compact trigger labels for name sorts', () => {
    render(
      <CatalogSortControl
        value="name_asc"
        options={[
          pickerSortOption('name_asc', 'Name: A–Z'),
          pickerSortOption('name_desc', 'Name: Z–A'),
        ]}
        onValueChange={vi.fn()}
        triggerAriaLabel="Spell sort order"
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Spell sort order' })).toHaveTextContent('A–Z')
  })
})
