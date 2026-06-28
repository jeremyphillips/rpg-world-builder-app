import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { TicketCreateDialog } from './ticket-create-dialog'

const mutateAsync = vi.fn()

vi.mock('../hooks/use-create-ticket', () => ({
  useCreateTicket: () => ({
    mutateAsync,
    isPending: false,
    isSuccess: false,
  }),
}))

function renderDialog(props: React.ComponentProps<typeof TicketCreateDialog> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <TicketCreateDialog {...props} />
    </QueryClientProvider>,
  )
}

describe('TicketCreateDialog', () => {
  it('opens and renders create form fields', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'New ticket' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByLabelText(/^description$/i)).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create ticket' })).toBeInTheDocument()
  })

  it('passes defaultEpicId to create mutation', async () => {
    mutateAsync.mockResolvedValueOnce({ id: 'new-ticket-id' })
    const user = userEvent.setup()
    renderDialog({ defaultEpicId: 'epic-123', open: true })

    await user.type(screen.getByLabelText(/title/i), 'Scoped ticket')
    await user.click(screen.getByRole('button', { name: 'Create ticket' }))

    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ epicId: 'epic-123', title: 'Scoped ticket', status: 'backlog' }),
    )
  })

  it('passes defaultStatus to create mutation', async () => {
    mutateAsync.mockResolvedValueOnce({ id: 'new-ticket-id' })
    const user = userEvent.setup()
    renderDialog({ defaultStatus: 'up_next', open: true })

    await user.type(screen.getByLabelText(/title/i), 'Up next ticket')
    await user.click(screen.getByRole('button', { name: 'Create ticket' }))

    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'up_next', title: 'Up next ticket' }),
    )
  })

  it('has no axe accessibility violations when open', async () => {
    const user = userEvent.setup()
    const { container } = renderDialog()
    await user.click(screen.getByRole('button', { name: 'New ticket' }))
    await waitFor(() => {
      expect(screen.getByLabelText(/^description$/i)).toBeInTheDocument()
    })

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
