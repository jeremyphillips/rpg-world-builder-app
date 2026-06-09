import { useState, type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'

import { ThemeProvider } from '@rpg/ui'

import { createQueryClient } from './query-client'

export function AppProviders({ children }: { children: ReactNode }) {
  // One client per app instance, created lazily so it survives re-renders.
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  )
}
