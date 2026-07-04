import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { CreateEpicDialog } from './epic-create-dialog'

const mutateAsync = vi.fn()

vi.mock('../hooks/use-create-epic', () => ({
  useCreateEpic: () => ({
    mutateAsync,
    isPending: false,
    isSuccess: false,
  }),
}))

function renderDialog() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CreateEpicDialog />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CreateEpicDialog', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
  })

  it('opens and renders create form fields', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Create epic' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
  })

  it('has no axe accessibility violations when open', async () => {
    const user = userEvent.setup()
    const { container } = renderDialog()
    await user.click(screen.getByRole('button', { name: 'Create epic' }))

    await expectNoAxeViolations(container)
  })
})
