import type { ComponentProps } from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { DuplicateContentDialog } from './duplicate-content-dialog.client'
import { contentOverviewListQueryKey } from '../overview/content-overview-query-keys'

const mutateAsync = vi.fn()

vi.mock('./use-duplicate-content', () => ({
  useDuplicateContent: () => ({
    mutateAsync,
    isPending: false,
    isSuccess: false,
  }),
}))

function renderDialog(
  props: Partial<ComponentProps<typeof DuplicateContentDialog>> = {},
  initialPath = '/',
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <DuplicateContentDialog
            campaignId="camp-1"
            contentTypeKey="classes"
            queryKeyFn={(id) => contentOverviewListQueryKey(id, 'classes')}
            source={{ id: 'cls-1', name: 'Fighter', source: 'homebrew' }}
            trigger={<button type="button">Duplicate</button>}
            {...props}
          />
        ),
      },
      {
        path: '/campaigns/camp-1/classes/:id/edit',
        element: <div>Edit destination</div>,
      },
    ],
    { initialEntries: [initialPath] },
  )

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('DuplicateContentDialog', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    mutateAsync.mockResolvedValue({ id: 'cls-copy' })
  })

  it('opens with default copy name and submits duplicate request', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Duplicate' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Name/)).toHaveValue('Fighter Copy')

    await user.click(screen.getByRole('button', { name: 'Duplicate class' }))

    expect(mutateAsync).toHaveBeenCalledWith({
      entityId: 'cls-1',
      name: 'Fighter Copy',
      idempotencyKey: expect.any(String),
    })
    expect(await screen.findByText('Edit destination')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations when open', async () => {
    const user = userEvent.setup()
    const { container } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Duplicate' }))
    await expectNoAxeViolations(container)
  })
})
