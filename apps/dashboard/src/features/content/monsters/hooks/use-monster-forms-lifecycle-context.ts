import { useContext } from 'react'

import {
  MonsterFormsLifecycleContext,
  type MonsterFormsLifecycleApi,
} from './monster-forms-lifecycle.context'

export function useMonsterFormsLifecycleContext(): MonsterFormsLifecycleApi {
  const context = useContext(MonsterFormsLifecycleContext)
  if (!context) {
    throw new Error('useMonsterFormsLifecycleContext requires MonsterFormsLifecycleProvider')
  }
  return context
}