import * as React from 'react'

export type QuickNpcEditingLockContextValue = {
  isLocked: boolean
  requestFocus: () => void
  register: (handlers: { requestFocus: () => void } | null) => void
}

export const QuickNpcEditingLockContext =
  React.createContext<QuickNpcEditingLockContextValue | null>(null)

export function useQuickNpcEditingLock(): QuickNpcEditingLockContextValue {
  const value = React.useContext(QuickNpcEditingLockContext)
  if (!value) {
    return {
      isLocked: false,
      requestFocus: () => undefined,
      register: () => undefined,
    }
  }
  return value
}
