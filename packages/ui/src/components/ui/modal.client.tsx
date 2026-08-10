'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

import { cn } from '../../lib/utils'
import {
  DialogCloseButton,
  DialogPanelHeader as ModalHeaderBase,
  dialogDismissHandlers,
} from './dialog-parts.client'
import { handleDialogOpenAutoFocus } from './dialog-focus.lib'
import {
  dialogContentFocusShellClasses,
  dialogPanelBodyVariants,
  dialogPanelFooterClasses,
} from './dialog-panel.variants'
import {
  modalContentVariants,
  modalOverlayVariants,
  type ModalContentLayout,
  type ModalSize,
} from './modal.variants'
import { useDialogLayerPortalContainer } from './use-dialog-layer-portal-container.client'

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
  /** `content` grows with children; `stable` reserves a fixed shell block-size. */
  layout?: ModalContentLayout
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
      layout,
      closeLabel = 'Close',
      closeOnOutsideClick = true,
      closeOnEscape = true,
      onOpenAutoFocus,
      onInteractOutside,
      onEscapeKeyDown,
      ...props
    },
    forwardedRef,
  ) => {
    const { composedRef, portalProvider } = useDialogLayerPortalContainer(forwardedRef)

    return (
      <DialogPrimitive.Portal>
        <ModalOverlay />
        <DialogPrimitive.Content
          ref={composedRef}
          tabIndex={-1}
          className={cn(
            modalContentVariants({ size, layout }),
            dialogContentFocusShellClasses,
            className,
          )}
          {...dialogDismissHandlers(
            closeOnOutsideClick,
            closeOnEscape,
            onInteractOutside,
            onEscapeKeyDown,
          )}
          onOpenAutoFocus={(event) => handleDialogOpenAutoFocus(event, onOpenAutoFocus)}
          {...props}
        >
          {portalProvider(
            <>
              {children}
              <DialogCloseButton closeLabel={closeLabel} />
            </>,
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    )
  },
)
ModalContent.displayName = 'Modal.Content'

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Required title — maps to `Dialog.Title` for the `aria-labelledby` wiring. */
  kicker?: React.ReactNode
  headline: React.ReactNode
  /** Optional supporting copy — maps to `Dialog.Description`. */
  description?: React.ReactNode
  /** Escape hatch — overrides the shared dialogTitle default from DialogPanelHeader. */
  headlineClassName?: string
  /** Right-aligned slot on the title row (e.g. primary action). */
  endSlot?: React.ReactNode
}

const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  (
    { className, kicker, headline, description, headlineClassName, endSlot, children, ...props },
    ref,
  ) => (
    <ModalHeaderBase
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
    </ModalHeaderBase>
  ),
)
ModalHeader.displayName = 'Modal.Header'

export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * When true, the body participates in a flex column layout so header/footer stay
   * pinned while inner content (e.g. TabbedForm with stickyChrome) owns scrolling.
   */
  stableBody?: boolean
}

const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, stableBody, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        dialogPanelBodyVariants(),
        stableBody && 'flex min-h-0 flex-1 flex-col overflow-hidden',
        className,
      )}
      {...props}
    />
  ),
)
ModalBody.displayName = 'Modal.Body'

const ModalFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(dialogPanelFooterClasses, className)} {...props} />
  ),
)
ModalFooter.displayName = 'Modal.Footer'

/**
 * Compound, accessible modal built on Radix Dialog (focus trap, scroll lock,
 * portal, Esc/overlay close baked in). On open, focus moves to the dialog
 * panel; opt a child in with `data-dialog-initial-focus` when immediate typing
 * is clearly intended.
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
