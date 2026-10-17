'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import {
  dialogPanelHeaderClasses,
  dialogPanelHeaderCopyStackClasses,
  dialogPanelHeaderHeadlineStackClasses,
  dialogPanelHeaderLeadRowClasses,
} from './dialog-panel.variants'
import {
  dialogPanelHeaderGlyphSizeClasses,
  dialogPanelHeaderIconControlClasses,
} from './dialog-panel-header-icon-control.lib'
import { headingVariants } from './heading.variants'
import { textVariants } from './text.variants'
import { cn } from '../../lib/utils'

export const dialogCloseButtonClasses = cn(
  'absolute right-4 top-2 z-30 disabled:pointer-events-none',
  dialogPanelHeaderIconControlClasses,
  'group-data-[has-media=true]/sheet:rounded-md group-data-[has-media=true]/sheet:bg-[var(--surface-current)]',
)

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
    <DialogPrimitive.Close aria-label={closeLabel} className={dialogCloseButtonClasses}>
      <X aria-hidden className={dialogPanelHeaderGlyphSizeClasses} />
    </DialogPrimitive.Close>
  )
}

export interface DialogPanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional line above the title (e.g. monospace id, status kicker). */
  kicker?: React.ReactNode
  headline: React.ReactNode
  description?: React.ReactNode
  /**
   * Decorative leading icon slot — caller supplies {@link IconContainer} or similar.
   * Interactive back navigation uses {@link DialogPanelHeaderNavButton}.
   */
  leadIcon?: React.ReactNode
  /** Merged onto the dialog title element (overrides the shared dialogTitle default). */
  headlineClassName?: string
  /** Right-aligned slot on the title row (e.g. primary action). */
  endSlot?: React.ReactNode
}

function renderKicker(kicker: React.ReactNode) {
  if (typeof kicker === 'string') {
    return <div className="text-sm">{kicker}</div>
  }

  return kicker
}

function DialogPanelHeaderTitleStack({
  kicker,
  headline,
  description,
  headlineClassName,
  endSlot,
}: Pick<
  DialogPanelHeaderProps,
  'kicker' | 'headline' | 'description' | 'headlineClassName' | 'endSlot'
>) {
  return (
    <>
      {kicker ? renderKicker(kicker) : null}
      <div className={dialogPanelHeaderHeadlineStackClasses}>
        <div className="flex items-start justify-between gap-4">
          <DialogPrimitive.Title
            className={cn(
              headlineClassName ?? headingVariants({ variant: 'dialogTitle' }),
              'min-w-0 flex-1',
            )}
          >
            {headline}
          </DialogPrimitive.Title>
          {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
        </div>
        {description ? (
          <DialogPrimitive.Description className={textVariants({ variant: 'small' })}>
            {description}
          </DialogPrimitive.Description>
        ) : null}
      </div>
    </>
  )
}

export const DialogPanelHeader = React.forwardRef<HTMLDivElement, DialogPanelHeaderProps>(
  (
    {
      className,
      kicker,
      headline,
      description,
      leadIcon,
      headlineClassName,
      endSlot,
      children,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(dialogPanelHeaderClasses, endSlot && 'pr-12', className)}
      {...props}
    >
      {leadIcon ? (
        <div className={dialogPanelHeaderLeadRowClasses}>
          <div className="shrink-0">{leadIcon}</div>
          <div className={dialogPanelHeaderCopyStackClasses}>
            <DialogPanelHeaderTitleStack
              kicker={kicker}
              headline={headline}
              description={description}
              headlineClassName={headlineClassName}
              endSlot={endSlot}
            />
          </div>
        </div>
      ) : (
        <DialogPanelHeaderTitleStack
          kicker={kicker}
          headline={headline}
          description={description}
          headlineClassName={headlineClassName}
          endSlot={endSlot}
        />
      )}
      {children}
    </div>
  ),
)
DialogPanelHeader.displayName = 'DialogPanelHeader'
