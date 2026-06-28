import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { TicketCreateDialog } from './ticket-create-dialog'

function renderDialog() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <TicketCreateDialog />
    </QueryClientProvider>,
  )
}

describe('TicketCreateDialog', () => {
  it('opens and renders create form fields', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'New ticket' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create ticket' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations when open', async () => {
    const user = userEvent.setup()
    const { container } = renderDialog()
    await user.click(screen.getByRole('button', { name: 'New ticket' }))

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
