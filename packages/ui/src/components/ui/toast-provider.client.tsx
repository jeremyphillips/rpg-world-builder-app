'use client'

import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'

import { ToastList } from './toast-managed.client'
import { ToastViewport } from './toast-viewport.client'
import {
  globalToastStore,
  setToastVisibleLimit,
  toast,
  TOAST_MAX_VISIBLE,
} from './toast-manager.client'

export type ToastProviderProps = {
  children: React.ReactNode
  maxVisible?: number
  viewport?: React.ReactNode
}

export function ToastProvider({
  children,
  maxVisible = TOAST_MAX_VISIBLE,
  viewport,
}: ToastProviderProps) {
  React.useEffect(() => {
    setToastVisibleLimit(maxVisible)
    return () => setToastVisibleLimit(TOAST_MAX_VISIBLE)
  }, [maxVisible])

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      <ToastList store={globalToastStore} maxVisible={maxVisible} />
      {viewport ?? <ToastViewport />}
    </ToastPrimitive.Provider>
  )
}

export { toast }
