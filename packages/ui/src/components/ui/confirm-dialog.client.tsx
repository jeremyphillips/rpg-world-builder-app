'use client'

import * as React from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'

import { cn } from '../../lib/utils'
import { Button, type ButtonProps } from './button.client'
import {
  dialogPanelActionRowClasses,
  dialogContentFocusShellClasses,
  dialogPanelSectionPaddingClasses,
} from './dialog-panel.variants'
import { handleDialogOpenAutoFocus } from './dialog-focus.lib'
import { headingVariants } from './heading.variants'
import { modalContentVariants, modalOverlayVariants } from './modal.variants'
import { textVariants } from './text.variants'

export interface ConfirmDialogProps {
  /** Whether the dialog is open (controlled). */
  open: boolean
  /** Open-state change handler — fires on Escape and after the action/cancel buttons. */
  onOpenChange: (open: boolean) => void
  /** Required title — maps to `AlertDialog.Title`. */
  headline: React.ReactNode
  /** Merged onto the title — defaults to confirmDialogTitle (19px). */
  headlineClassName?: string
  /** Optional supporting copy — maps to `AlertDialog.Description`. */
  description?: React.ReactNode
  /** Confirm button label. */
  confirmLabel?: string
  /** Cancel button label. */
  cancelLabel?: string
  /** Visual variant for the confirm button (use `destructive` for irreversible actions). */
  confirmVariant?: ButtonProps['variant']
  /** Invoked when the confirm button is pressed. */
  onConfirm: () => void
  /** Invoked when the cancel button is pressed. */
  onCancel?: () => void
  /** When true, open focus lands on the confirm button via `data-dialog-initial-focus`. */
  focusConfirmOnOpen?: boolean
}

/**
 * A focused "are you sure?" confirmation built on Radix AlertDialog
 * (`role="alertdialog"`, does not dismiss on outside click). Reuse it anywhere a
 * decision must be confirmed — delete prompts, leave-page guards, or a `Modal`'s
 * guarded close (wired to `useModal`'s `confirmingClose` state). Renders one
 * stacking layer above a `Modal` (`z-[60]`).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  headline,
  description,
  headlineClassName,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'default',
  onConfirm,
  onCancel,
  focusConfirmOnOpen = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className={cn(modalOverlayVariants(), 'z-[60]')} />
        <AlertDialogPrimitive.Content
          tabIndex={-1}
          className={cn(
            modalContentVariants({ size: 'sm' }),
            dialogPanelSectionPaddingClasses,
            dialogContentFocusShellClasses,
            'z-[60] gap-4',
          )}
          onOpenAutoFocus={handleDialogOpenAutoFocus}
        >
          <div className="flex flex-col space-y-1.5">
            <AlertDialogPrimitive.Title
              className={headlineClassName ?? headingVariants({ variant: 'confirmDialogTitle' })}
            >
              {headline}
            </AlertDialogPrimitive.Title>
            {description ? (
              <AlertDialogPrimitive.Description className={textVariants({ variant: 'small' })}>
                {description}
              </AlertDialogPrimitive.Description>
            ) : null}
          </div>
          <div className={dialogPanelActionRowClasses}>
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="outline" onClick={onCancel}>
                {cancelLabel}
              </Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button
                variant={confirmVariant}
                onClick={onConfirm}
                {...(focusConfirmOnOpen ? { 'data-dialog-initial-focus': true } : {})}
              >
                {confirmLabel}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}
