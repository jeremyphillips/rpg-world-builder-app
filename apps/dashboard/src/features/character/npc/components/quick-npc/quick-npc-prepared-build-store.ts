import { createContext } from 'react'

import type { QuickNpcPreparedDraft } from '../../lib/quick-npc/quick-npc-create'

export type QuickNpcPreparedBuildStore = {
  get: () => QuickNpcPreparedDraft | null
  set: (next: QuickNpcPreparedDraft | null) => void
  subscribe: (listener: () => void) => () => void
}

export function createQuickNpcPreparedBuildStore(): QuickNpcPreparedBuildStore {
  let value: QuickNpcPreparedDraft | null = null
  const listeners = new Set<() => void>()
  return {
    get: () => value,
    set: (next) => {
      if (next === value) return
      value = next
      for (const listener of listeners) listener()
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export const QuickNpcPreparedBuildContext = createContext<QuickNpcPreparedBuildStore | null>(null)
