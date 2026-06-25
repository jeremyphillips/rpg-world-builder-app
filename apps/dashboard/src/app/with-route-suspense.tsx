import type { ComponentType, LazyExoticComponent } from 'react'

import { RouteSuspense } from './route-suspense'

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
