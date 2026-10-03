import * as React from 'react'

import { useQuickNpcPreparedBuild } from '../../hooks/use-quick-npc-prepared-build'
import {
  createQuickNpcPreparedBuildStore,
  QuickNpcPreparedBuildContext,
} from './quick-npc-prepared-build-store'

/**
 * Carries the live prepared Quick NPC build to tab content and the footer. The
 * store lives outside the form so the form tree does not re-render on each
 * derivation; only subscribers do.
 */
export function QuickNpcPreparedBuildProvider({ children }: { children: React.ReactNode }) {
  const [store] = React.useState(createQuickNpcPreparedBuildStore)
  return (
    <QuickNpcPreparedBuildContext.Provider value={store}>
      {children}
    </QuickNpcPreparedBuildContext.Provider>
  )
}

/** Publishes {@link useQuickNpcPreparedBuild} into the nearest provider. Renders nothing. */
export function QuickNpcPreparedBuildSync(props: Parameters<typeof useQuickNpcPreparedBuild>[0]) {
  const store = React.useContext(QuickNpcPreparedBuildContext)
  const prepared = useQuickNpcPreparedBuild(props)

  React.useLayoutEffect(() => {
    store?.set(prepared)
  }, [prepared, store])

  return null
}
