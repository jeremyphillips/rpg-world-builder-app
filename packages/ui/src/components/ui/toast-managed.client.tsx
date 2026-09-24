'use client'

import * as React from 'react'
import { AlertTriangle, Check, XCircle } from 'lucide-react'

import { Button } from './button.client'
import { Toast } from './toast.client'
import {
  resolveToastDuration,
  TOAST_DISMISS_LABEL,
  TOAST_REMOVE_DELAY_MS,
  type ToastRecord,
  type ToastStore,
  type ToastTone,
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

function ToastLeading({ record, tone }: { record: ToastRecord; tone: ToastTone }) {
  const leading = record.leading ?? <ToastToneIcon tone={tone} />
  if (!leading) return null
  return <div className={record.leading ? 'shrink-0' : 'mt-0.5 shrink-0'}>{leading}</div>
}

function ToastCopy({ record }: { record: ToastRecord }) {
  if (!record.title && !record.description) return null
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      {record.title ? <Toast.Title>{record.title}</Toast.Title> : null}
      {record.description ? <Toast.Description>{record.description}</Toast.Description> : null}
    </div>
  )
}

function ToastActions({ record, dismissible }: { record: ToastRecord; dismissible: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      {record.action ? (
        <Toast.Action altText={record.action.label} asChild>
          <Button
            type="button"
            variant={record.action.variant ?? 'outline'}
            size="sm"
            onClick={record.action.onClick}
          >
            {record.action.label}
          </Button>
        </Toast.Action>
      ) : null}
      {dismissible ? <Toast.Close aria-label={TOAST_DISMISS_LABEL} /> : null}
    </div>
  )
}

export function ManagedToast({
  record,
  store,
}: {
  record: ToastRecord
  store: Pick<ToastStore, 'dismiss' | 'remove'>
}) {
  const tone = record.tone ?? 'default'
  const dismissible = record.dismissible ?? true
  const urgent = record.urgent ?? false
  const centerRow = Boolean(record.leading)

  return (
    <Toast.Root
      open={record.open}
      duration={resolveToastDuration(record)}
      type={urgent ? 'foreground' : 'background'}
      tone={tone}
      className={centerRow ? 'items-center' : undefined}
      onOpenChange={(open) => {
        if (!open) {
          store.dismiss(record.id)
          window.setTimeout(() => {
            store.remove(record.id)
          }, TOAST_REMOVE_DELAY_MS)
        }
      }}
    >
      <ToastLeading record={record} tone={tone} />
      <ToastCopy record={record} />
      <ToastActions record={record} dismissible={dismissible} />
    </Toast.Root>
  )
}

export function ToastList({ store, maxVisible }: { store: ToastStore; maxVisible: number }) {
  const [state, setState] = React.useState(store.getState)

  React.useEffect(() => store.subscribe(setState), [store])

  const visibleToasts = state.toasts.filter((record) => record.open).slice(0, maxVisible)

  return (
    <>
      {visibleToasts.map((record) => (
        <ManagedToast key={record.id} record={record} store={store} />
      ))}
    </>
  )
}
