import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SearchBar } from './search-bar.client'

describe('SearchBar', () => {
  it('renders placeholder-only search without a visible label', () => {
    render(
      <SearchBar
        id="organization-search"
        value=""
        onValueChange={vi.fn()}
        placeholder="Search organizations…"
      />,
    )

    expect(screen.getByRole('searchbox', { name: 'Search organizations…' })).toBeInTheDocument()
    expect(screen.queryByText('Search organizations')).not.toBeInTheDocument()
  })

  it('shows a clear control only when the field has a value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    const { rerender } = render(
      <SearchBar
        id="organization-search"
        value=""
        onValueChange={onValueChange}
        placeholder="Search organizations…"
      />,
    )

    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()

    rerender(
      <SearchBar
        id="organization-search"
        value="guild"
        onValueChange={onValueChange}
        placeholder="Search organizations…"
      />,
    )

    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(onValueChange).toHaveBeenCalledWith('')

    rerender(
      <SearchBar
        id="organization-search"
        value="guild"
        onValueChange={onValueChange}
        placeholder="Search organizations…"
        disabled
      />,
    )
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })
})
