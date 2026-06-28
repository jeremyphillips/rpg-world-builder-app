import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import { TicketCard } from './ticket-card'
import { blockedSampleTicket, sampleTicket } from '../test-fixtures'

describe('TicketCard', () => {
  it('renders key, title, and badges', () => {
    render(<TicketCard ticket={sampleTicket} epicTitle="Core platform" onSelect={vi.fn()} />)

    expect(screen.getByText('BENCH-001')).toBeInTheDocument()
    expect(screen.getByText('Add ticket CRUD UI')).toBeInTheDocument()
    expect(screen.getByText('Feature')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Core platform')).toBeInTheDocument()
  })

  it('shows blocked indicator when blockers exist', () => {
    render(<TicketCard ticket={blockedSampleTicket} onSelect={vi.fn()} />)
    expect(screen.getByLabelText('Blocked by other tickets')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<TicketCard ticket={sampleTicket} onSelect={vi.fn()} />)
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
