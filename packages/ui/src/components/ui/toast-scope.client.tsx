'use client'

import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'

import { cn } from '../../lib/utils'
import { ToastList } from './toast-managed.client'
import { createToastStore, type ToastStore } from './toast-manager.client'
import { toastModalViewportVariants } from './toast.variants'
import { TOAST_MAX_VISIBLE } from './toast.constants'

const ToastScopeContext = React.createContext<ToastStore | null>(null)

export function useToastScope(): ToastStore {
  const store = React.useContext(ToastScopeContext)
  if (!store) {
    throw new Error('useToastScope must be used within ToastScopeProvider')
  }
  return store
}

export type ToastScopeProviderProps = {
  children: React.ReactNode
  maxVisible?: number
  viewportClassName?: string
}

/** Isolated toast queue for a subtree (for example, a modal) that does not share the global list. */
export function ToastScopeProvider({
  children,
  maxVisible = TOAST_MAX_VISIBLE,
  viewportClassName,
}: ToastScopeProviderProps) {
  const store = React.useMemo(() => createToastStore(maxVisible), [maxVisible])

  React.useEffect(() => {
    store.setVisibleLimit(maxVisible)
  }, [maxVisible, store])

  return (
    <ToastScopeContext.Provider value={store}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        <ToastList store={store} maxVisible={maxVisible} />
        <ToastPrimitive.Viewport className={cn(toastModalViewportVariants(), viewportClassName)} />
      </ToastPrimitive.Provider>
    </ToastScopeContext.Provider>
  )
}
