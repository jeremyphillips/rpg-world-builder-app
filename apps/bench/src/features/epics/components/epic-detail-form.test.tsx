import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { sampleEpic } from '../test-fixtures'
import { EpicDetailForm } from './epic-detail-form'

vi.mock('../hooks/use-update-epic', () => ({
  useUpdateEpic: () => ({ mutateAsync: vi.fn(), isPending: false, isSuccess: false }),
}))

vi.mock('../hooks/use-delete-epic', () => ({
  useDeleteEpic: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <EpicDetailForm epic={sampleEpic} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('EpicDetailForm', () => {
  it('renders editable fields and delete confirm copy', async () => {
    const user = userEvent.setup()
    renderForm()

    expect(screen.getByLabelText(/title/i)).toHaveValue(sampleEpic.title)
    await user.click(screen.getByRole('button', { name: 'Delete epic' }))
    expect(
      screen.getByText(/Tickets assigned to this epic will be moved back to unassigned/i),
    ).toBeInTheDocument()
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
