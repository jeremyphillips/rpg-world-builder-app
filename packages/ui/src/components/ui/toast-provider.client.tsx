'use client'

import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { AlertTriangle, Check, XCircle } from 'lucide-react'

import { Button } from './button.client'
import { Toast } from './toast.client'
import { ToastViewport } from './toast-viewport.client'
import {
  getToastState,
  removeToast,
  resolveToastDuration,
  subscribeToasts,
  toast,
  type ToastRecord,
  type ToastTone,
  TOAST_MAX_VISIBLE,
} from './toast-manager.client'

function ToastToneIcon({ tone }: { tone: ToastTone }) {
  switch (tone) {
    case 'success':
      return <Check className="size-4 text-semantic-success" aria-hidden />
    case 'warning':
      return <AlertTriangle className="size-4 text-semantic-warning" aria-hidden />
    case 'destructive':
      return <XCircle className="size-4 text-semantic-destructive" aria-hidden />
    default:
      return null
  }
}

function ManagedToast({ record }: { record: ToastRecord }) {
  const tone = record.tone ?? 'default'
  const dismissible = record.dismissible ?? true
  const toneIcon = <ToastToneIcon tone={tone} />

  return (
    <Toast.Root
      open={record.open}
      duration={resolveToastDuration(record)}
      role={record.urgent ? 'alert' : 'status'}
      tone={tone}
      onOpenChange={(open) => {
        if (!open) {
          record.onDismiss?.()
          toast.dismiss(record.id)
          window.setTimeout(() => {
            removeToast(record.id)
          }, 200)
        }
      }}
    >
      {toneIcon ? <div className="mt-0.5 shrink-0">{toneIcon}</div> : null}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {record.title ? <Toast.Title>{record.title}</Toast.Title> : null}
        {record.description ? <Toast.Description>{record.description}</Toast.Description> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {record.action ? (
          <Toast.Action altText={record.action.label} asChild>
            <Button type="button" variant="outline" size="sm" onClick={record.action.onClick}>
              {record.action.label}
            </Button>
          </Toast.Action>
        ) : null}
        {dismissible ? <Toast.Close aria-label="Dismiss notification" /> : null}
      </div>
    </Toast.Root>
  )
}

function ToastList({ maxVisible = TOAST_MAX_VISIBLE }: { maxVisible?: number }) {
  const [state, setState] = React.useState(getToastState)

  React.useEffect(() => subscribeToasts(setState), [])

  const visibleToasts = state.toasts.filter((record) => record.open).slice(0, maxVisible)

  return (
    <>
      {visibleToasts.map((record) => (
        <ManagedToast key={record.id} record={record} />
      ))}
    </>
  )
}

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
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      <ToastList maxVisible={maxVisible} />
      {viewport ?? <ToastViewport />}
    </ToastPrimitive.Provider>
  )
}

export { toast }
