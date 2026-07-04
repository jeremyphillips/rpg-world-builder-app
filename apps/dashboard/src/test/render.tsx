import type { ReactElement } from 'react'
import { render, type RenderResult } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

/** Fresh QueryClient with retries disabled so error paths fail fast. */
export function makeTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

export type RenderWithProvidersOptions = {
  queryClient?: QueryClient
  initialEntries?: string[]
}

/**
 * Renders under QueryClientProvider + MemoryRouter — the standard harness for
 * components that fetch via TanStack Query and/or use router hooks or links.
 * Pass `<Routes>` in `ui` when the test needs route matching (guards, params).
 *
 * @example
 * renderWithProviders(<DashboardHome />)
 * renderWithProviders(<Routes>…</Routes>, { initialEntries: ['/admin/users'] })
 */
export function renderWithProviders(
  ui: ReactElement,
  { queryClient = makeTestQueryClient(), initialEntries = ['/'] }: RenderWithProvidersOptions = {},
): RenderResult {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}
