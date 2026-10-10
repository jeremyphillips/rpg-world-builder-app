/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AdminUserListItem } from '@rpg/contracts'

import { catalogOverviewPreferencesKey } from '@/lib/data-table/catalog-overview-preferences'
import { makeTestQueryClient } from '@/test/render'

import { AdminUsersOverviewTable } from './admin-users-overview-table'
import { ADMIN_USERS_TABLE_KEY } from '../lib/admin-users-labels'
import { useAdminUsers } from '../hooks/use-admin-users'

vi.mock('../hooks/use-admin-users')
vi.mock('../components/admin-user-row-actions', () => ({
  AdminUserRowActions: () => null,
}))

const MOCK_USER: AdminUserListItem = {
  id: 'user-1',
  displayName: 'Ada Lovelace',
  email: 'ada@example.com',
  role: 'user',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  lastSignedInAt: '2024-06-01T00:00:00.000Z',
  lastActiveAt: '2024-06-01T00:00:00.000Z',
  campaignCounts: { owned: 0, coOwned: 0, joined: 1 },
  characterCount: 2,
  canDelete: true,
  deleteBlockedReasons: [],
}

function mockAdminUsersQuery() {
  vi.mocked(useAdminUsers).mockReturnValue({
    data: {
      users: [MOCK_USER],
      pagination: { page: 1, totalPages: 1, total: 1 },
    },
    isPending: false,
    isError: false,
    isLoading: false,
    isFetching: false,
    status: 'success',
    fetchStatus: 'idle',
    error: null,
    refetch: vi.fn(),
  } as ReturnType<typeof useAdminUsers>)
}

function renderAdminTable(initialEntry = '/') {
  const queryClient = makeTestQueryClient()
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <QueryClientProvider client={queryClient}>
            <AdminUsersOverviewTable />
          </QueryClientProvider>
        ),
      },
    ],
    { initialEntries: [initialEntry] },
  )

  render(<RouterProvider router={router} />)
  return {
    getSearch: () => router.state.location.search,
  }
}

describe('AdminUsersOverviewTable', () => {
  beforeEach(() => {
    localStorage.clear()
    mockAdminUsersQuery()

    if (!HTMLElement.prototype.hasPointerCapture) {
      HTMLElement.prototype.hasPointerCapture = () => false
    }
    if (!HTMLElement.prototype.setPointerCapture) {
      HTMLElement.prototype.setPointerCapture = () => undefined
    }
    if (!HTMLElement.prototype.releasePointerCapture) {
      HTMLElement.prototype.releasePointerCapture = () => undefined
    }
  })

  it('hydrates filter state from the URL on load', () => {
    renderAdminTable('/?q=ada&access=admin&activity=inactive')

    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('ada')
    expect(screen.getByRole('combobox', { name: 'Access' })).toBeInTheDocument()
  })

  it('syncs primary filter edits to the query string', async () => {
    const user = userEvent.setup()
    const { getSearch } = renderAdminTable('/')

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'grace')

    await waitFor(
      () => {
        expect(getSearch()).toContain('q=grace')
      },
      { timeout: 800 },
    )
  })

  it('resets page to 1 when filters change', async () => {
    const user = userEvent.setup()
    const { getSearch } = renderAdminTable('/?page=3')

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'x')

    await waitFor(
      () => {
        expect(getSearch()).toContain('q=x')
        expect(getSearch()).not.toContain('page=3')
      },
      { timeout: 800 },
    )
  })

  it('clear filters resets primary and advanced fields', async () => {
    const user = userEvent.setup()
    const { getSearch } = renderAdminTable('/?q=ada&activity=inactive')

    await user.click(screen.getByRole('button', { name: /additional filters/i }))
    expect(screen.getByRole('combobox', { name: 'Activity' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))

    await waitFor(() => {
      expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('')
      expect(getSearch()).not.toContain('q=')
      expect(getSearch()).not.toContain('activity=')
    })
  })

  it('persists advanced disclosure open state under the admin table key', async () => {
    const user = userEvent.setup()
    renderAdminTable()

    await user.click(screen.getByRole('button', { name: /additional filters/i }))

    const stored = JSON.parse(
      localStorage.getItem(catalogOverviewPreferencesKey(ADMIN_USERS_TABLE_KEY)) ?? '{}',
    ) as { advancedOpen?: boolean }

    expect(stored.advancedOpen).toBe(true)
  })

  it('leaves sort query params unchanged when filters render', () => {
    const { getSearch } = renderAdminTable('/?sort=-displayName&q=ada')

    expect(getSearch()).toContain('sort=-displayName')
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('ada')
  })

  it('persists column visibility preferences for the admin table key', async () => {
    const user = userEvent.setup()
    renderAdminTable()

    await user.click(screen.getByRole('button', { name: 'Choose visible columns' }))
    await user.click(screen.getByRole('checkbox', { name: /Characters/i }))

    const stored = JSON.parse(
      localStorage.getItem(catalogOverviewPreferencesKey(ADMIN_USERS_TABLE_KEY)) ?? '{}',
    ) as { columnVisibility?: Record<string, boolean> }

    expect(stored.columnVisibility?.characterCount).toBe(false)
  })
})
