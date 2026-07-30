'use client'

import type { ReactNode } from 'react'

import { TOAST_DURATION, TOAST_MAX_VISIBLE, type ToastTone } from './toast.constants'

export type { ToastTone } from './toast.constants'
export { TOAST_DURATION, TOAST_MAX_VISIBLE, TOAST_DISMISS_LABEL } from './toast.constants'

export type ToastAction = {
  label: string
  onClick: () => void
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
}

export type ToastRecord = ToastOptions & {
  id: string
  open: boolean
}

type ToastState = {
  toasts: ToastRecord[]
}

const TOAST_LIMIT = TOAST_MAX_VISIBLE

let toastCount = 0

function genToastId(): string {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER
  return `toast-${toastCount}`
}

const listeners = new Set<(state: ToastState) => void>()

let memoryState: ToastState = { toasts: [] }

function emitState(): void {
  listeners.forEach((listener) => {
    listener(memoryState)
  })
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

function upsertToast(options: ToastOptions): string {
  const id = options.id ?? genToastId()
  const openToasts = memoryState.toasts.filter((toast) => toast.open && toast.id !== id)

  memoryState = {
    toasts: [{ ...options, id, open: true }, ...openToasts].slice(0, TOAST_LIMIT),
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

export function subscribeToasts(listener: (state: ToastState) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getToastState(): ToastState {
  return memoryState
}

export function toast(options: ToastOptions): string {
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

export { removeToast }
