import type { Decorator } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Storybook decorator for dashboard stories that call TanStack Query hooks.
 * Not applied globally — add per story via `decorators: [withDashboardProviders]`.
 *
 * @example
 * export default { decorators: [withDashboardProviders] } satisfies Meta
 */
export const withDashboardProviders: Decorator = (Story) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  )
}
