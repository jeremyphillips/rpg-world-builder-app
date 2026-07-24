import { act, renderHook, waitFor } from '@testing-library/react'
import {
  createMemoryRouter,
  RouterProvider,
  useSearchParams,
} from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import {
  createEqualsFilter,
  createFilterSchema,
  createTextFilter,
} from '@rpg/ui/filters'

import { useContentOverviewQueryState } from './use-content-overview-query-state.client'

type Row = {
  name: string
  status: 'draft' | 'published'
}

type TestFilterState = {
  search?: string
  status?: Row['status']
}

const schema = createFilterSchema<Row, TestFilterState>([
  createTextFilter<Row, TestFilterState, 'search'>({
    id: 'search',
    label: 'Search',
    getSearchText: (row) => row.name,
    url: { key: 'q' },
  }),
  createEqualsFilter<Row, TestFilterState, 'status', Row['status']>({
    id: 'status',
    label: 'Status',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
    ],
    getValue: (row) => row.status,
  }),
])

const allowedSortIds = ['name', 'status'] as const
const defaultSort = { id: 'name' } as const

function renderOverviewQueryState(initialEntry = '/') {
  let router: ReturnType<typeof createMemoryRouter>

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    router = createMemoryRouter([{ path: '/', element: <>{children}</> }], {
      initialEntries: [initialEntry],
    })
    return <RouterProvider router={router} />
  }

  const view = renderHook(
    () => ({
      state: useContentOverviewQueryState({
        schema,
        allowedSortIds,
        defaultSort,
      }),
      searchParams: useSearchParams()[0],
    }),
    { wrapper },
  )

  return {
    ...view,
    getRouter: () => router,
  }
}

describe('useContentOverviewQueryState', () => {
  it('hydrates synchronously from the current URL without an initial write-back', () => {
    const { result } = renderOverviewQueryState('/?q=fire&status=draft&page=2')

    expect(result.current.state.query).toEqual({
      filters: { search: 'fire', status: 'draft' },
      sort: defaultSort,
      page: 2,
    })
    expect(result.current.searchParams.get('q')).toBe('fire')
    expect(result.current.searchParams.get('status')).toBe('draft')
    expect(result.current.searchParams.get('page')).toBe('2')
  })

  it('syncs programmatic filter changes with replace history and resets page', async () => {
    const { result } = renderOverviewQueryState('/?page=3')

    await waitFor(() => {
      expect(result.current.state.query.page).toBe(3)
    })

    act(() => {
      result.current.state.actions.setFilterValue('status', 'draft')
    })

    await waitFor(() => {
      expect(result.current.searchParams.get('status')).toBe('draft')
      expect(result.current.searchParams.get('page')).toBeNull()
      expect(result.current.state.query.page).toBe(1)
    })
  })

  it('updates local state from URL changes without generating another navigation', async () => {
    const { result, getRouter } = renderOverviewQueryState('/?q=alpha')

    await waitFor(() => {
      expect(result.current.state.query.filters.search).toBe('alpha')
    })

    const router = getRouter()
    const navigateSpy = vi.spyOn(router, 'navigate')

    act(() => {
      router.navigate('/?q=beta&page=2')
    })

    await waitFor(() => {
      expect(result.current.state.query.filters.search).toBe('beta')
      expect(result.current.state.query.page).toBe(2)
    })

    expect(navigateSpy).toHaveBeenCalledTimes(1)
  })

  it('supports push history for navigational quick views', async () => {
    const { result } = renderOverviewQueryState('/')

    act(() => {
      result.current.state.actions.setFilterValue('status', 'draft', { history: 'push' })
    })

    await waitFor(() => {
      expect(result.current.searchParams.get('status')).toBe('draft')
    })
  })
})
