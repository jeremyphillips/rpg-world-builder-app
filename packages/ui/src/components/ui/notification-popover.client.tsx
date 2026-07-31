'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { Eyebrow } from './eyebrow'

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
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          sideOffset={8}
          className={cn(
            'z-50 w-[min(100vw-2rem,24rem)] rounded-md border border-border bg-popover shadow-md outline-none',
            contentClassName,
          )}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
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
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-1">
      <Eyebrow as="h2" size="sm">
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
