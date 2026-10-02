import * as React from 'react'

type QuickNpcEditingLockContextValue = {
  isLocked: boolean
  requestFocus: () => void
  register: (handlers: { requestFocus: () => void } | null) => void
}

const QuickNpcEditingLockContext = React.createContext<QuickNpcEditingLockContextValue | null>(null)

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

  const value = React.useMemo(
    () => ({ isLocked, requestFocus, register }),
    [isLocked, register, requestFocus],
  )

  return (
    <QuickNpcEditingLockContext.Provider value={value}>
      {children}
    </QuickNpcEditingLockContext.Provider>
  )
}

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
