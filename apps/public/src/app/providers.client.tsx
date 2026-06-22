'use client'

import { useState, type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'

import { createQueryClient } from './query-client'

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient)

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
