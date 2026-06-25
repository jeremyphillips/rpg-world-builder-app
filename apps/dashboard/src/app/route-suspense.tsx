import { Suspense, type ReactNode } from 'react'

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
