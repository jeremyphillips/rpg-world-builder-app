'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import { cn } from '../../lib/utils'
import { modalContentVariants, modalOverlayVariants, type ModalSize } from './modal.variants'

const ModalRoot = DialogPrimitive.Root

const ModalTrigger = DialogPrimitive.Trigger

const ModalClose = DialogPrimitive.Close

const ModalOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} className={cn(modalOverlayVariants(), className)} {...props} />
))
ModalOverlay.displayName = 'Modal.Overlay'

export interface ModalContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  /** Width preset for the panel. */
  size?: ModalSize
  /** Accessible name for the built-in close (X) button. */
  closeLabel?: string
  /** Dismiss when clicking the overlay/outside the panel (default `true`). */
  closeOnOutsideClick?: boolean
  /** Dismiss on the Escape key (default `true`). */
  closeOnEscape?: boolean
}

const ModalContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(
  (
    {
      className,
      children,
      size,
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
      <ModalOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(modalContentVariants({ size }), className)}
        onInteractOutside={(event) => {
          if (!closeOnOutsideClick) event.preventDefault()
          onInteractOutside?.(event)
        }}
        onEscapeKeyDown={(event) => {
          if (!closeOnEscape) event.preventDefault()
          onEscapeKeyDown?.(event)
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label={closeLabel}
          className="absolute right-4 top-4 rounded-sm text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
)
ModalContent.displayName = 'Modal.Content'

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Required title — maps to `Dialog.Title` for the `aria-labelledby` wiring. */
  headline: React.ReactNode
  /** Optional supporting copy — maps to `Dialog.Description`. */
  description?: React.ReactNode
}

const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, headline, description, children, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
      <DialogPrimitive.Title className="font-display text-lg font-semibold leading-none tracking-tight">
        {headline}
      </DialogPrimitive.Title>
      {description ? (
        <DialogPrimitive.Description className="text-sm text-muted-foreground">
          {description}
        </DialogPrimitive.Description>
      ) : null}
      {children}
    </div>
  ),
)
ModalHeader.displayName = 'Modal.Header'

const ModalBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('overflow-y-auto p-6 pt-0 text-sm', className)} {...props} />
  ),
)
ModalBody.displayName = 'Modal.Body'

const ModalFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-end gap-2 p-6 pt-0', className)}
      {...props}
    />
  ),
)
ModalFooter.displayName = 'Modal.Footer'

/**
 * Compound, accessible modal built on Radix Dialog (focus trap, scroll lock,
 * portal, Esc/overlay close baked in). Compose the parts directly:
 *
 * ```tsx
 * <Modal.Root open={open} onOpenChange={setOpen}>
 *   <Modal.Content size="sm">
 *     <Modal.Header headline="Delete?" description="This cannot be undone." />
 *     <Modal.Body>…</Modal.Body>
 *     <Modal.Footer>…</Modal.Footer>
 *   </Modal.Content>
 * </Modal.Root>
 * ```
 *
 * `Modal.Content` requires a `Modal.Header` headline so Radix can wire
 * `aria-labelledby`; for media/icon-only modals, wrap a visually hidden title
 * instead of omitting it.
 */
export const Modal = {
  Root: ModalRoot,
  Trigger: ModalTrigger,
  Content: ModalContent,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
  Close: ModalClose,
}
