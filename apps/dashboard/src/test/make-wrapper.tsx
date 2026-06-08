import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Creates a fresh QueryClient wrapper for each test.
 * Use as the `wrapper` option in `renderHook` or as a render wrapper.
 *
 * @example
 * const { result } = renderHook(() => useMyHook(), { wrapper: makeQueryWrapper() })
 */
export function makeQueryWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}
