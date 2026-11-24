import type { ReactNode } from 'react'

import { MonsterFormsLifecycleContext } from './monster-forms-lifecycle.context'
import { useMonsterFormsLifecycle } from './use-monster-forms-lifecycle'

export function MonsterFormsLifecycleProvider({ children }: { children: ReactNode }) {
  const { dialog, ...api } = useMonsterFormsLifecycle()
  return (
    <MonsterFormsLifecycleContext.Provider value={api}>
      {children}
      {dialog}
    </MonsterFormsLifecycleContext.Provider>
  )
}