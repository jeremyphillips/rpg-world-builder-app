'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import { headingVariants } from './heading.variants'
import { textVariants } from './text.variants'
import { cn } from '../../lib/utils'

const dialogCloseButtonClassName =
  'absolute right-4 top-4 rounded-sm text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none'

export function dialogDismissHandlers(
  closeOnOutsideClick: boolean,
  closeOnEscape: boolean,
  onInteractOutside?: DialogPrimitive.DialogContentProps['onInteractOutside'],
  onEscapeKeyDown?: DialogPrimitive.DialogContentProps['onEscapeKeyDown'],
): Pick<DialogPrimitive.DialogContentProps, 'onInteractOutside' | 'onEscapeKeyDown'> {
  return {
    onInteractOutside: (event) => {
      if (!closeOnOutsideClick) event.preventDefault()
      onInteractOutside?.(event)
    },
    onEscapeKeyDown: (event) => {
      if (!closeOnEscape) event.preventDefault()
      onEscapeKeyDown?.(event)
    },
  }
}

export function DialogCloseButton({ closeLabel }: { closeLabel: string }) {
  return (
    <DialogPrimitive.Close aria-label={closeLabel} className={dialogCloseButtonClassName}>
      <X className="size-4" />
    </DialogPrimitive.Close>
  )
}

export interface DialogPanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional line above the title (e.g. monospace id, status kicker). */
  kicker?: React.ReactNode
  headline: React.ReactNode
  description?: React.ReactNode
  /** Merged onto the dialog title element (overrides default heading styles). */
  headlineClassName?: string
}

export const DialogPanelHeader = React.forwardRef<HTMLDivElement, DialogPanelHeaderProps>(
  ({ className, kicker, headline, description, headlineClassName, children, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
      {kicker ? <div className="text-sm">{kicker}</div> : null}
      <DialogPrimitive.Title
        className={cn(headingVariants({ variant: 'card' }), headlineClassName)}
      >
        {headline}
      </DialogPrimitive.Title>
      {description ? (
        <DialogPrimitive.Description className={textVariants({ variant: 'small' })}>
          {description}
        </DialogPrimitive.Description>
      ) : null}
      {children}
    </div>
  ),
)
DialogPanelHeader.displayName = 'DialogPanelHeader'
