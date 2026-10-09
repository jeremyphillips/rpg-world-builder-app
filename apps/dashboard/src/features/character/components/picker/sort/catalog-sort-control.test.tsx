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
      <CatalogSortControl value="name_asc" options={nameSortOptions} onValueChange={vi.fn()} />,
    )

    expect(screen.getByRole('combobox', { name: 'Sort' })).toHaveTextContent('A–Z')
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('uses compact floating label type by default', () => {
    render(
      <CatalogSortControl value="name_asc" options={nameSortOptions} onValueChange={vi.fn()} />,
    )

    expect(
      screen
        .getByRole('combobox', { name: 'Sort' })
        .closest('[data-populated]')
        ?.querySelector('[data-floating-label]'),
    ).toHaveClass('text-xs')
  })

  it('uses comfortable resting type inside comfortable chrome', () => {
    render(
      <FilterChromeProvider density="comfortable">
        <CatalogSortControl value="name_asc" options={nameSortOptions} onValueChange={vi.fn()} />
      </FilterChromeProvider>,
    )

    const caption = screen
      .getByRole('combobox', { name: 'Sort' })
      .closest('[data-populated]')
      ?.querySelector('[data-floating-label]')
    expect(caption).toHaveClass('text-md')
    expect(caption).not.toHaveClass('text-xs')
  })
})
