import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { BacklogTicketCard } from './backlog-ticket-card'
import { sampleTicket } from '../test-fixtures'

function renderWithQuery(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('BacklogTicketCard', () => {
  it('renders card actions menu', () => {
    renderWithQuery(<BacklogTicketCard ticket={sampleTicket} onSelect={vi.fn()} />)
    expect(
      screen.getByRole('button', { name: `Actions for ${sampleTicket.key}` }),
    ).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithQuery(
      <BacklogTicketCard ticket={sampleTicket} onSelect={vi.fn()} />,
    )
    await expectNoAxeViolations(container)
  })
})
