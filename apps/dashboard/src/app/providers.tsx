import { useState, type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'

import { ThemeProvider, ToastProvider } from '@rpg/ui'

import { DashboardToastViewport } from '@/components/feedback/dashboard-toast-viewport'
import { createQueryClient } from './query-client'

export function AppProviders({ children }: { children: ReactNode }) {
  // One client per app instance, created lazily so it survives re-renders.
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider viewport={<DashboardToastViewport />}>{children}</ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
