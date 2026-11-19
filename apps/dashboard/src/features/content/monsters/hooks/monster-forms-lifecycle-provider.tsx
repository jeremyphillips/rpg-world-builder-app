import { createContext, useContext, type ReactNode } from 'react'

import {
  useMonsterFormsLifecycle,
  type MonsterFormsLifecycleApi,
} from './use-monster-forms-lifecycle'

const MonsterFormsLifecycleContext = createContext<MonsterFormsLifecycleApi | null>(null)

export function MonsterFormsLifecycleProvider({ children }: { children: ReactNode }) {
  const { dialog, ...api } = useMonsterFormsLifecycle()
  return (
    <MonsterFormsLifecycleContext.Provider value={api}>
      {children}
      {dialog}
    </MonsterFormsLifecycleContext.Provider>
  )
}

export function useMonsterFormsLifecycleContext(): MonsterFormsLifecycleApi {
  const context = useContext(MonsterFormsLifecycleContext)
  if (!context) {
    throw new Error('useMonsterFormsLifecycleContext requires MonsterFormsLifecycleProvider')
  }
  return context
}
