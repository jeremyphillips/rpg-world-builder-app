import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FormSectionProvider } from '../../form/context/form-section.context'
import { FilterChromeProvider } from '../../filters/filter-chrome.context'
import { SearchBar } from './search-bar.client'
import { searchBarControlHeightClass } from './search-bar-control-size.lib'

const SEARCH_ARIA = 'Search organizations'

describe('SearchBar', () => {
  it('uses ariaLabel for the accessible name, not placeholder', () => {
    render(
      <SearchBar
        id="organization-search"
        value=""
        onValueChange={vi.fn()}
        placeholder="Type to filter…"
        ariaLabel={SEARCH_ARIA}
      />,
    )

    expect(screen.getByRole('searchbox', { name: SEARCH_ARIA })).toBeInTheDocument()
  })

  it('shows inset clear with slot width classes when the field has a value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    const { rerender } = render(
      <SearchBar
        id="organization-search"
        value=""
        onValueChange={onValueChange}
        ariaLabel={SEARCH_ARIA}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()

    rerender(
      <SearchBar
        id="organization-search"
        value="guild"
        onValueChange={onValueChange}
        ariaLabel={SEARCH_ARIA}
      />,
    )

    const clear = screen.getByRole('button', { name: 'Clear search' })
    expect(clear.className).toContain('w-8')
    expect(clear.className).toContain('inset-y-0')
    expect(screen.getByRole('searchbox')).toHaveClass(
      'pr-8',
      '[&::-webkit-search-cancel-button]:appearance-none',
    )
    await user.click(clear)
    expect(onValueChange).toHaveBeenCalledWith('')
  })

  it('restores focus to the search input after clear', async () => {
    const user = userEvent.setup()

    render(
      <SearchBar
        id="organization-search"
        value="guild"
        onValueChange={vi.fn()}
        ariaLabel={SEARCH_ARIA}
      />,
    )

    const input = screen.getByRole('searchbox', { name: SEARCH_ARIA })
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    await waitFor(() => {
      expect(document.activeElement).toBe(input)
    })
  })

  it('hides clear when disabled', () => {
    render(
      <SearchBar
        id="organization-search"
        value="guild"
        onValueChange={vi.fn()}
        ariaLabel={SEARCH_ARIA}
        disabled
      />,
    )
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })

  it('applies filter chrome size over form section (class contract)', () => {
    render(
      <FormSectionProvider density="compact">
        <FilterChromeProvider density="comfortable">
          <SearchBar id="density-search" value="" onValueChange={vi.fn()} ariaLabel={SEARCH_ARIA} />
        </FilterChromeProvider>
      </FormSectionProvider>,
    )

    const input = screen.getByRole('searchbox', { name: SEARCH_ARIA })
    expect(input.className).toContain(searchBarControlHeightClass('md'))
  })

  it('renders embedded appearance with chromeless input classes', () => {
    render(
      <SearchBar
        id="embedded-search"
        appearance="embedded"
        value="q"
        onValueChange={vi.fn()}
        ariaLabel="Search choices"
        placeholder="Search choices…"
      />,
    )

    const input = screen.getByRole('searchbox', { name: 'Search choices' })
    expect(input.className).toContain('border-0')
    expect(input.className).toContain('bg-transparent')
  })
})
