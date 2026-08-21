import { act, renderHook, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, useSearchParams } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { createEqualsFilter, createFilterSchema, createTextFilter } from '@rpg/ui/filters'

import { useContentOverviewQueryState } from './use-content-overview-query-state'

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

function renderOverviewQueryState(
  initialEntry = '/',
  options?: { allowedSortIds?: readonly string[] },
) {
  let router: ReturnType<typeof createMemoryRouter>
  let sortIds = options?.allowedSortIds ?? allowedSortIds

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
        allowedSortIds: sortIds,
        defaultSort,
      }),
      searchParams: useSearchParams()[0],
    }),
    { wrapper },
  )

  return {
    ...view,
    getRouter: () => router,
    setAllowedSortIds: (next: readonly string[]) => {
      sortIds = next
      view.rerender()
    },
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

  it('does not rewrite the URL when allowedSortIds is reallocated with the same ids', async () => {
    const { result, getRouter, setAllowedSortIds } = renderOverviewQueryState('/')

    act(() => {
      result.current.state.actions.setFilterValue('status', 'draft')
    })

    await waitFor(() => {
      expect(result.current.searchParams.get('status')).toBe('draft')
    })

    const router = getRouter()
    const navigateSpy = vi.spyOn(router, 'navigate')
    const callsAfterFilter = navigateSpy.mock.calls.length

    setAllowedSortIds(['name', 'status'])

    await waitFor(() => {
      expect(result.current.searchParams.get('status')).toBe('draft')
    })

    expect(navigateSpy.mock.calls.length).toBe(callsAfterFilter)
  })

  it('keeps query referentially stable across rerenders when the URL is unchanged', async () => {
    const { result, rerender } = renderOverviewQueryState('/?status=draft')

    await waitFor(() => {
      expect(result.current.state.query.filters.status).toBe('draft')
    })

    const queryBefore = result.current.state.query
    const actionsBefore = result.current.state.actions
    rerender()
    rerender()

    expect(result.current.state.query).toBe(queryBefore)
    expect(result.current.state.actions).toBe(actionsBefore)
  })

  it('applies filter changes optimistically before the URL updates', async () => {
    const { result } = renderOverviewQueryState('/')

    act(() => {
      result.current.state.actions.setFilterValue('status', 'draft')
    })

    expect(result.current.state.query.filters.status).toBe('draft')

    await waitFor(() => {
      expect(result.current.searchParams.get('status')).toBe('draft')
    })
  })

  it('debounces text filter URL writes', async () => {
    vi.useFakeTimers()

    try {
      const { result } = renderOverviewQueryState('/')

      act(() => {
        result.current.state.actions.setFilterValue('search', 'fire')
      })

      expect(result.current.state.query.filters.search).toBe('fire')
      expect(result.current.searchParams.get('q')).toBeNull()

      await act(async () => {
        await vi.advanceTimersByTimeAsync(300)
      })

      expect(result.current.searchParams.get('q')).toBe('fire')
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not loop navigation when setting the same filter value repeatedly', async () => {
    const { result, getRouter } = renderOverviewQueryState('/?status=draft')

    await waitFor(() => {
      expect(result.current.state.query.filters.status).toBe('draft')
    })

    const router = getRouter()
    const navigateSpy = vi.spyOn(router, 'navigate')
    const callsAfterHydration = navigateSpy.mock.calls.length

    act(() => {
      result.current.state.actions.setFilterValue('status', 'draft')
      result.current.state.actions.setFilterValue('status', 'draft')
      result.current.state.actions.setFilterValue('status', 'draft')
    })

    await waitFor(() => {
      expect(result.current.searchParams.get('status')).toBe('draft')
    })

    expect(navigateSpy.mock.calls.length).toBe(callsAfterHydration)
  })

  it('ignores repeated writes of the same filter value', async () => {
    const { result, getRouter } = renderOverviewQueryState('/?status=draft')

    await waitFor(() => {
      expect(result.current.state.query.filters.status).toBe('draft')
    })

    const router = getRouter()
    const navigateSpy = vi.spyOn(router, 'navigate')
    const callsAfterHydration = navigateSpy.mock.calls.length

    act(() => {
      result.current.state.actions.setFilterValue('status', 'draft')
      result.current.state.actions.setFilterValue('status', 'draft')
    })

    await waitFor(() => {
      expect(result.current.searchParams.get('status')).toBe('draft')
    })

    expect(navigateSpy.mock.calls.length).toBe(callsAfterHydration)
  })
})
