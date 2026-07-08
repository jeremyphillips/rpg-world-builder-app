'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

import { cn } from '../../lib/utils'
import {
  DialogCloseButton,
  DialogPanelHeader as SheetHeaderBase,
  dialogDismissHandlers,
} from './dialog-parts.client'
import { modalOverlayVariants } from './modal.variants'
import { sheetBodyVariants, sheetContentVariants, type SheetSide } from './sheet.variants'

const SheetRoot = DialogPrimitive.Root

const SheetTrigger = DialogPrimitive.Trigger

const SheetClose = DialogPrimitive.Close

const SheetOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} className={cn(modalOverlayVariants(), className)} {...props} />
))
SheetOverlay.displayName = 'Sheet.Overlay'

export interface SheetContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  side?: SheetSide
  closeLabel?: string
  closeOnOutsideClick?: boolean
  closeOnEscape?: boolean
}

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(
  (
    {
      className,
      children,
      side,
      closeLabel = 'Close',
      closeOnOutsideClick = true,
      closeOnEscape = true,
      onInteractOutside,
      onEscapeKeyDown,
      ...props
    },
    ref,
  ) => (
    <DialogPrimitive.Portal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(sheetContentVariants({ side }), className)}
        {...dialogDismissHandlers(
          closeOnOutsideClick,
          closeOnEscape,
          onInteractOutside,
          onEscapeKeyDown,
        )}
        {...props}
      >
        {children}
        <DialogCloseButton closeLabel={closeLabel} />
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
)
SheetContent.displayName = 'Sheet.Content'

export interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional line above the title (e.g. monospace id). */
  kicker?: React.ReactNode
  headline: React.ReactNode
  description?: React.ReactNode
  /** Merged onto the dialog title element (overrides default heading styles). */
  headlineClassName?: string
  /** Right-aligned slot on the title row (e.g. primary action). */
  endSlot?: React.ReactNode
}

const SheetHeader = React.forwardRef<HTMLDivElement, SheetHeaderProps>(
  (
    { className, kicker, headline, description, headlineClassName, endSlot, children, ...props },
    ref,
  ) => (
    <SheetHeaderBase
      ref={ref}
      className={className}
      kicker={kicker}
      headline={headline}
      description={description}
      headlineClassName={headlineClassName}
      endSlot={endSlot}
      {...props}
    >
      {children}
    </SheetHeaderBase>
  ),
)
SheetHeader.displayName = 'Sheet.Header'

const SheetBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(sheetBodyVariants(), className)} {...props} />
  ),
)
SheetBody.displayName = 'Sheet.Body'

const SheetFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-end gap-2 border-t p-6', className)}
      {...props}
    />
  ),
)
SheetFooter.displayName = 'Sheet.Footer'

/** Edge-anchored panel on Radix Dialog — use for contextual add/edit flows. */
export const Sheet = {
  Root: SheetRoot,
  Trigger: SheetTrigger,
  Content: SheetContent,
  Header: SheetHeader,
  Body: SheetBody,
  Footer: SheetFooter,
  Close: SheetClose,
}
