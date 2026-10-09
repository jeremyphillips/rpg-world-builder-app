import * as React from 'react'

import {
  QuickNpcEditingLockContext,
  type QuickNpcEditingLockContextValue,
} from './use-quick-npc-editing-lock'

export function QuickNpcEditingLockProvider({ children }: { children: React.ReactNode }) {
  const focusRef = React.useRef<(() => void) | null>(null)
  const [isLocked, setIsLocked] = React.useState(false)

  const register = React.useCallback((handlers: { requestFocus: () => void } | null) => {
    focusRef.current = handlers?.requestFocus ?? null
    setIsLocked(handlers !== null)
  }, [])

  const requestFocus = React.useCallback(() => {
    focusRef.current?.()
  }, [])

  const value = React.useMemo<QuickNpcEditingLockContextValue>(
    () => ({ isLocked, requestFocus, register }),
    [isLocked, register, requestFocus],
  )

  return (
    <QuickNpcEditingLockContext.Provider value={value}>
      {children}
    </QuickNpcEditingLockContext.Provider>
  )
}
