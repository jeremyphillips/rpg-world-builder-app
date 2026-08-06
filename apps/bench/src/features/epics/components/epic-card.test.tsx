import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { sampleEpic, sampleEpicTickets } from '../test-fixtures'
import { EpicCard } from './epic-card'

const firstRecentTicket = sampleEpicTickets[0]!

describe('EpicCard', () => {
  it('links to epic detail and shows counts', () => {
    render(
      <MemoryRouter>
        <EpicCard
          epic={sampleEpic}
          counts={{ open: 2, blocked: 1, done: 0 }}
          recentlyActive={sampleEpicTickets}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: sampleEpic.title })).toHaveAttribute(
      'href',
      `/epics/${sampleEpic.id}`,
    )
    expect(screen.getByText('Open:')).toBeInTheDocument()
    expect(screen.getByText(/BENCH-001/)).toBeInTheDocument()
  })

  it('calls onSelectTicket when a recently active item is clicked', async () => {
    const onSelectTicket = vi.fn()
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <EpicCard
          epic={sampleEpic}
          counts={{ open: 2, blocked: 1, done: 0 }}
          recentlyActive={sampleEpicTickets}
          onSelectTicket={onSelectTicket}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /BENCH-001: Species picker/i }))
    expect(onSelectTicket).toHaveBeenCalledWith(firstRecentTicket.id)
  })

  it('links recently active tickets when onSelectTicket is omitted', () => {
    render(
      <MemoryRouter>
        <EpicCard
          epic={sampleEpic}
          counts={{ open: 2, blocked: 1, done: 0 }}
          recentlyActive={sampleEpicTickets}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /BENCH-001: Species picker/i })).toHaveAttribute(
      'href',
      `/tickets/${firstRecentTicket.id}`,
    )
  })

  it('renders accent stripe from epic badge color', () => {
    const { container } = render(
      <MemoryRouter>
        <EpicCard epic={sampleEpic} counts={{ open: 1, blocked: 0, done: 0 }} recentlyActive={[]} />
      </MemoryRouter>,
    )

    const stripe = container.querySelector('[aria-hidden="true"]')
    expect(stripe).toHaveStyle({ backgroundColor: sampleEpic.badgeColor })
  })

  it('shows plain-text epic description summary when stored as HTML', () => {
    render(
      <MemoryRouter>
        <EpicCard
          epic={{
            ...sampleEpic,
            goal: undefined,
            description: '<p>End-to-end player character creation flows.</p>',
          }}
          counts={{ open: 1, blocked: 0, done: 0 }}
          recentlyActive={[]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('End-to-end player character creation flows.')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <EpicCard epic={sampleEpic} counts={{ open: 1, blocked: 0, done: 0 }} recentlyActive={[]} />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
