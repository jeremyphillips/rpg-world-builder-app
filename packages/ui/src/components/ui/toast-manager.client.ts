'use client'

import type { ReactNode } from 'react'

import type { ButtonProps } from './button.client'
import { TOAST_DURATION, TOAST_MAX_VISIBLE, type ToastTone } from './toast.constants'

export type { ToastTone } from './toast.constants'
export {
  TOAST_DURATION,
  TOAST_MAX_VISIBLE,
  TOAST_DISMISS_LABEL,
  TOAST_REMOVE_DELAY_MS,
} from './toast.constants'

export type ToastAction = {
  label: string
  onClick: () => void
  variant?: ButtonProps['variant']
}

export type ToastOptions = {
  id?: string
  title?: ReactNode
  description?: ReactNode
  tone?: ToastTone
  duration?: number | 'persistent'
  action?: ToastAction
  dismissible?: boolean
  onDismiss?: () => void
  urgent?: boolean
  leading?: ReactNode
}

export type ToastRecord = ToastOptions & {
  id: string
  open: boolean
}

type ToastState = {
  toasts: ToastRecord[]
}

export type ToastStore = ReturnType<typeof createToastStore>

export const globalToastStore = createToastStore()

export function setToastVisibleLimit(limit: number): void {
  globalToastStore.setVisibleLimit(limit)
}

let toastCount = 0

function genToastId(): string {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER
  return `toast-${toastCount}`
}

export function resolveToastDuration(options: Pick<ToastOptions, 'duration' | 'tone'>): number {
  if (options.duration === 'persistent') {
    return Number.POSITIVE_INFINITY
  }

  if (options.duration != null) {
    return options.duration
  }

  return TOAST_DURATION[options.tone ?? 'default']
}

export function createToastStore(initialVisibleLimit = TOAST_MAX_VISIBLE) {
  const listeners = new Set<(state: ToastState) => void>()
  let memoryState: ToastState = { toasts: [] }
  let visibleLimit = initialVisibleLimit

  function emitState(): void {
    listeners.forEach((listener) => {
      listener(memoryState)
    })
  }

  function upsertToast(options: ToastOptions): string {
    const id = options.id ?? genToastId()
    const withoutId = memoryState.toasts.filter((toast) => toast.id !== id)
    const openToasts = withoutId.filter((toast) => toast.open)
    const closedToasts = withoutId.filter((toast) => !toast.open)
    const nextOpen = [{ ...options, id, open: true }, ...openToasts]

    while (nextOpen.length > visibleLimit) {
      const evicted = nextOpen.pop()
      evicted?.onDismiss?.()
    }

    memoryState = {
      toasts: [...nextOpen, ...closedToasts],
    }

    emitState()
    return id
  }

  function dismissToast(toastId?: string): void {
    if (toastId == null) {
      return
    }

    const target = memoryState.toasts.find((toast) => toast.id === toastId)
    target?.onDismiss?.()

    memoryState = {
      toasts: memoryState.toasts.map((toast) =>
        toast.id === toastId ? { ...toast, open: false } : toast,
      ),
    }

    emitState()
  }

  function dismissAllToasts(): void {
    memoryState.toasts.forEach((toast) => {
      toast.onDismiss?.()
    })

    memoryState = {
      toasts: memoryState.toasts.map((toast) => ({ ...toast, open: false })),
    }

    emitState()
  }

  function removeToast(toastId: string): void {
    memoryState = {
      toasts: memoryState.toasts.filter((toast) => toast.id !== toastId),
    }

    emitState()
  }

  function subscribe(listener: (state: ToastState) => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  function toast(options: ToastOptions): string {
    return upsertToast(options)
  }

  toast.success = (title: ReactNode, options: Omit<ToastOptions, 'title' | 'tone'> = {}) =>
    toast({ ...options, title, tone: 'success' })

  toast.warning = (title: ReactNode, options: Omit<ToastOptions, 'title' | 'tone'> = {}) =>
    toast({ ...options, title, tone: 'warning' })

  toast.error = (title: ReactNode, options: Omit<ToastOptions, 'title' | 'tone'> = {}) =>
    toast({ ...options, title, tone: 'destructive' })

  toast.dismiss = (toastId?: string) => {
    dismissToast(toastId)
  }

  toast.dismissAll = () => {
    dismissAllToasts()
  }

  return {
    toast,
    dismiss: toast.dismiss,
    dismissAll: toast.dismissAll,
    subscribe,
    getState: () => memoryState,
    remove: removeToast,
    setVisibleLimit(limit: number) {
      visibleLimit = limit
    },
  }
}

export function subscribeToasts(listener: (state: ToastState) => void): () => void {
  return globalToastStore.subscribe(listener)
}

export function getToastState(): ToastState {
  return globalToastStore.getState()
}

export const toast = globalToastStore.toast

export function removeToast(toastId: string): void {
  globalToastStore.remove(toastId)
}
