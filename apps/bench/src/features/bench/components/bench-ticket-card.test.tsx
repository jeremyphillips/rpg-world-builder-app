import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { blockedBenchTicket, upNextTicket } from '../test-fixtures'
import { useMoveTicketStatus } from '../hooks/use-move-ticket-status'
import { BenchTicketCard } from './bench-ticket-card'

const mutateAsync = vi.fn()

vi.mock('../hooks/use-move-ticket-status', () => ({
  useMoveTicketStatus: vi.fn(() => ({
    moveToStatus: mutateAsync,
    confirmOpen: false,
    onConfirmOpenChange: vi.fn(),
    onConfirmMove: vi.fn(),
    isPending: false,
  })),
}))

function renderCard(props: React.ComponentProps<typeof BenchTicketCard>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <BenchTicketCard {...props} />
    </QueryClientProvider>,
  )
}

describe('BenchTicketCard', () => {
  it('invokes move handler from overflow menu', async () => {
    const user = userEvent.setup()
    renderCard({ ticket: upNextTicket })

    await user.click(screen.getByRole('button', { name: `Move ${upNextTicket.key}` }))
    await user.click(screen.getByRole('menuitem', { name: 'Move to In Progress' }))

    expect(mutateAsync).toHaveBeenCalledWith(upNextTicket, 'in_progress')
  })

  it('shows confirm dialog when blocked ticket move requires confirmation', () => {
    vi.mocked(useMoveTicketStatus).mockReturnValueOnce({
      moveToStatus: vi.fn(),
      confirmOpen: true,
      onConfirmOpenChange: vi.fn(),
      onConfirmMove: vi.fn(),
      isPending: false,
    })

    renderCard({ ticket: blockedBenchTicket })

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(
      screen.getByText('This ticket still has blockers. Mark it done anyway?'),
    ).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderCard({ ticket: upNextTicket })

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
