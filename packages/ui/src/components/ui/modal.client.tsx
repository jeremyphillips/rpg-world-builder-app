'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

import { cn } from '../../lib/utils'
import {
  DialogCloseButton,
  DialogPanelHeader as ModalHeaderBase,
  dialogDismissHandlers,
} from './dialog-parts.client'
import {
  modalContentVariants,
  modalBodyVariants,
  modalOverlayVariants,
  type ModalSize,
} from './modal.variants'

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
ModalContent.displayName = 'Modal.Content'

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Required title — maps to `Dialog.Title` for the `aria-labelledby` wiring. */
  kicker?: React.ReactNode
  headline: React.ReactNode
  /** Optional supporting copy — maps to `Dialog.Description`. */
  description?: React.ReactNode
  headlineClassName?: string
}

const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, kicker, headline, description, headlineClassName, children, ...props }, ref) => (
    <ModalHeaderBase
      ref={ref}
      className={className}
      kicker={kicker}
      headline={headline}
      description={description}
      headlineClassName={headlineClassName}
      {...props}
    >
      {children}
    </ModalHeaderBase>
  ),
)
ModalHeader.displayName = 'Modal.Header'

const ModalBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(modalBodyVariants(), className)} {...props} />
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
