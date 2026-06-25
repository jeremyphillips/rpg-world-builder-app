import { Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react'

import { Spinner } from '@rpg/ui'

function RouteFallback() {
  return (
    <div className="flex justify-center py-8">
      <Spinner />
    </div>
  )
}

/** Suspense boundary for lazily loaded route modules. */
export function RouteSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>
}

/** Wraps a lazy route component with the shared Suspense fallback. */
export function withRouteSuspense<P extends object = Record<string, never>>(
  LazyComponent: LazyExoticComponent<ComponentType<P>>,
) {
  function SuspendedRoute(props: P) {
    return (
      <RouteSuspense>
        <LazyComponent {...props} />
      </RouteSuspense>
    )
  }

  return SuspendedRoute
}
