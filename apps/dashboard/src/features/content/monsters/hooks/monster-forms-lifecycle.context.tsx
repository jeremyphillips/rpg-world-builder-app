import { createContext } from 'react'

import type { MonsterFormsLifecycleApi } from './use-monster-forms-lifecycle'

export type { MonsterFormsLifecycleApi }

export const MonsterFormsLifecycleContext = createContext<MonsterFormsLifecycleApi | null>(null)