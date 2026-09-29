'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'

import { cn } from '../../lib/utils'
import { portalPopoverSurfaceClasses } from './surface-current.lib'
import { Button } from './button.client'
import { Eyebrow } from './eyebrow'

const NotificationPopoverTitleIdContext = React.createContext<string | null>(null)

export type NotificationPopoverProps = {
  trigger: React.ReactNode
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  contentClassName?: string
  align?: 'start' | 'center' | 'end'
}

export function NotificationPopover({
  trigger,
  children,
  open,
  onOpenChange,
  contentClassName,
  align = 'end',
}: NotificationPopoverProps) {
  const titleId = React.useId()

  return (
    <NotificationPopoverTitleIdContext.Provider value={titleId}>
      <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align={align}
            sideOffset={8}
            aria-labelledby={titleId}
            className={cn(
              'z-50 w-[min(100vw-2rem,24rem)] rounded-md border border-border bg-popover shadow-md outline-none',
              portalPopoverSurfaceClasses,
              contentClassName,
            )}
          >
            {children}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </NotificationPopoverTitleIdContext.Provider>
  )
}

export type NotificationPopoverHeaderProps = {
  title: string
  actionLabel?: string
  onAction?: () => void
  actionDisabled?: boolean
}

export function NotificationPopoverHeader({
  title,
  actionLabel,
  onAction,
  actionDisabled = false,
}: NotificationPopoverHeaderProps) {
  const titleId = React.useContext(NotificationPopoverTitleIdContext)

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-1">
      <Eyebrow as="h2" size="sm" id={titleId ?? undefined}>
        {title}
      </Eyebrow>
      {actionLabel && onAction ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          density="compact"
          onClick={onAction}
          disabled={actionDisabled}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
