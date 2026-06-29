import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { TicketDetailForm } from './ticket-detail-form'
import { sampleTicket } from '../test-fixtures'

vi.mock('@/features/epics', () => ({
  useEpicsList: () => ({ data: [] }),
}))

vi.mock('../hooks/use-all-tickets', () => ({
  useAllTickets: () => ({ data: [] }),
}))

vi.mock('../hooks/use-update-ticket', () => ({
  useUpdateTicket: () => ({ mutateAsync: vi.fn(), isPending: false, isSuccess: false }),
}))

vi.mock('../hooks/use-delete-ticket', () => ({
  useDeleteTicket: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <TicketDetailForm ticket={sampleTicket} />
    </QueryClientProvider>,
  )
}

describe('TicketDetailForm', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('renders tab triggers and switches tabs', async () => {
    const user = userEvent.setup()
    renderForm()

    await waitFor(() => {
      expect(screen.getByLabelText(/^description$/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Done when' }))
    expect(screen.getByText('Paste bullets')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderForm()
    await waitFor(() => {
      expect(screen.getByLabelText(/^description$/i)).toBeInTheDocument()
    })
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false }, 'landmark-unique': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
