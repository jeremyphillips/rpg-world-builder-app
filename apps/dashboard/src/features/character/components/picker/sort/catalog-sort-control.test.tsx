import { FilterChromeProvider } from '@rpg/ui/filters'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CatalogSortControl } from './catalog-sort-control'

describe('CatalogSortControl', () => {
  it('resolves Greenfield trigger labels from axes', () => {
    render(<CatalogSortControl value="name_asc" axes={['name']} onValueChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Sort by, Name: A–Z' })).toHaveTextContent(
      'Name: A–Z',
    )
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('uses compact button sizing by default', () => {
    render(<CatalogSortControl value="name_asc" axes={['name']} onValueChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Sort by, Name: A–Z' })).toHaveClass('text-xs')
  })

  it('uses comfortable button sizing inside comfortable chrome', () => {
    render(
      <FilterChromeProvider density="comfortable">
        <CatalogSortControl value="name_asc" axes={['name']} onValueChange={vi.fn()} />
      </FilterChromeProvider>,
    )

    const trigger = screen.getByRole('button', { name: 'Sort by, Name: A–Z' })
    expect(trigger).not.toHaveClass('text-xs')
  })

  it('includes best_match preset above axis groups', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    render(
      <CatalogSortControl
        value="best_match"
        axes={['name']}
        presets={['best_match']}
        onValueChange={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Sort by, Best match' }))
    expect(screen.getByRole('menuitemradio', { name: 'Best match' })).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
  })
})
