'use client'

import * as React from 'react'

import { Spinner } from '../../components/ui/spinner'

/** Suspense boundary for lazily loaded form field controls. */
export function LazyFieldSuspense({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-10 items-center">
          <Spinner size="sm" />
        </div>
      }
    >
      {children}
    </React.Suspense>
  )
}

/** Loads a named export from a field module on first render of that field type. */
export function lazyFieldComponent<P extends object>(
  importFn: () => Promise<Record<string, unknown>>,
  exportName: string,
) {
  return React.lazy(() =>
    importFn().then((module) => ({
      default: module[exportName] as React.ComponentType<P>,
    })),
  )
}
