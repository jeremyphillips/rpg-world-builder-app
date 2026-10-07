import { FilterChromeProvider } from '@rpg/ui/filters'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CatalogSortControl } from './catalog-sort-control'
import { pickerSortOption } from './catalog-picker-sort-labels.lib'

const nameSortOptions = [
  pickerSortOption('name_asc', 'Name: A–Z'),
  pickerSortOption('name_desc', 'Name: Z–A'),
] as const

describe('CatalogSortControl', () => {
  it('shows compact trigger labels for name sorts', () => {
    render(
      <CatalogSortControl
        value="name_asc"
        options={nameSortOptions}
        onValueChange={vi.fn()}
        triggerAriaLabel="Spell sort order"
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Spell sort order' })).toHaveTextContent('A–Z')
  })

  it('uses compact filter caption classes by default', () => {
    render(
      <CatalogSortControl value="name_asc" options={nameSortOptions} onValueChange={vi.fn()} />,
    )

    expect(screen.getByText('Sort')).toHaveClass('text-xs', 'text-muted-foreground')
  })

  it('uses comfortable filter caption classes inside comfortable chrome', () => {
    render(
      <FilterChromeProvider density="comfortable">
        <CatalogSortControl value="name_asc" options={nameSortOptions} onValueChange={vi.fn()} />
      </FilterChromeProvider>,
    )

    const caption = screen.getByText('Sort')
    expect(caption).toHaveClass('text-sm', 'text-muted-foreground')
    expect(caption).not.toHaveClass('text-xs')
  })
})
