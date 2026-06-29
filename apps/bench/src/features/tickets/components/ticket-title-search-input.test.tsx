import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TicketTitleSearchInput } from './ticket-title-search-input'

describe('TicketTitleSearchInput', () => {
  it('calls onValueChange when typing', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<TicketTitleSearchInput value="" onValueChange={onValueChange} />)

    await user.type(screen.getByRole('searchbox', { name: 'Search tickets' }), 'auth')
    expect(onValueChange).toHaveBeenCalled()
  })

  it('renders a visible label when provided', () => {
    render(
      <TicketTitleSearchInput label="Search" value="" onValueChange={vi.fn()} id="bench-search" />,
    )

    expect(screen.getByLabelText('Search')).toBeInTheDocument()
  })
})
