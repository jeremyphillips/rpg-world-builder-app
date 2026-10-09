import { FilterChromeProvider } from '@rpg/ui/filters'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CatalogSortControl } from './catalog-sort-control'
import { pickerSortOption } from './catalog-picker-sort-labels.lib'

const nameSortOptions = [
  pickerSortOption('name_asc', 'Name: A–Z', 'A–Z'),
  pickerSortOption('name_desc', 'Name: Z–A', 'Z–A'),
] as const

describe('CatalogSortControl', () => {
  it('shows compact trigger labels for name sorts', () => {
    render(
      <CatalogSortControl value="name_asc" options={nameSortOptions} onValueChange={vi.fn()} />,
    )

    expect(screen.getByRole('button', { name: 'Sort by, A–Z' })).toHaveTextContent('A–Z')
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('uses compact button sizing by default', () => {
    render(
      <CatalogSortControl value="name_asc" options={nameSortOptions} onValueChange={vi.fn()} />,
    )

    expect(screen.getByRole('button', { name: 'Sort by, A–Z' })).toHaveClass('text-xs')
  })

  it('uses comfortable button sizing inside comfortable chrome', () => {
    render(
      <FilterChromeProvider density="comfortable">
        <CatalogSortControl value="name_asc" options={nameSortOptions} onValueChange={vi.fn()} />
      </FilterChromeProvider>,
    )

    const trigger = screen.getByRole('button', { name: 'Sort by, A–Z' })
    expect(trigger).not.toHaveClass('text-xs')
  })
})
