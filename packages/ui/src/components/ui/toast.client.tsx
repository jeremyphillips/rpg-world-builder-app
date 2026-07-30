'use client'

import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X } from 'lucide-react'

import { cn } from '../../lib/utils'
import { TOAST_DISMISS_LABEL } from './toast.constants'
import {
  toastActionsVariants,
  toastCloseVariants,
  toastDescriptionVariants,
  toastTitleVariants,
  toastVariants,
  type ToastVariantProps,
} from './toast.variants'

export type { ToastTone } from './toast.constants'

export type ToastProps = ToastVariantProps & {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  icon?: React.ReactNode
  className?: string
  /** Opt-in assertive announcement for errors requiring immediate attention. */
  urgent?: boolean
}

const ToastRoot = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & ToastVariantProps
>(({ className, tone, ...props }, ref) => (
  <ToastPrimitive.Root ref={ref} className={cn(toastVariants({ tone }), className)} {...props} />
))
ToastRoot.displayName = 'Toast.Root'

const ToastAction = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action ref={ref} className={cn(toastActionsVariants(), className)} {...props} />
))
ToastAction.displayName = 'Toast.Action'

const ToastClose = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(toastCloseVariants(), className)}
    toast-close=""
    {...props}
  >
    <X className="size-4" />
  </ToastPrimitive.Close>
))
ToastClose.displayName = 'Toast.Close'

const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn(toastTitleVariants(), className)} {...props} />
))
ToastTitle.displayName = 'Toast.Title'

const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn(toastDescriptionVariants(), className)}
    {...props}
  />
))
ToastDescription.displayName = 'Toast.Description'

/**
 * Visual toast shell for Storybook and low-level composition. Does not own queue,
 * duration, IDs, or deduplication — use `toast()` from the manager for that.
 */
export function ToastPresentation({
  tone = 'default',
  title,
  description,
  action,
  dismissible = true,
  onDismiss,
  icon,
  urgent = false,
  className,
}: ToastProps) {
  const hasCopy = title != null || description != null

  return (
    <div role={urgent ? 'alert' : 'status'} className={cn(toastVariants({ tone }), className)}>
      {icon ? <div className="mt-0.5 shrink-0">{icon}</div> : null}
      {hasCopy ? (
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {title ? <p className={toastTitleVariants()}>{title}</p> : null}
          {description ? <p className={toastDescriptionVariants()}>{description}</p> : null}
        </div>
      ) : null}
      <div className={toastActionsVariants()}>
        {action}
        {dismissible ? (
          <button
            type="button"
            aria-label={TOAST_DISMISS_LABEL}
            className={toastCloseVariants()}
            onClick={onDismiss}
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

export const Toast = {
  Root: ToastRoot,
  Title: ToastTitle,
  Description: ToastDescription,
  Action: ToastAction,
  Close: ToastClose,
  Presentation: ToastPresentation,
}
