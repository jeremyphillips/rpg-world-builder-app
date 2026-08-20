import * as React from 'react'

import { cn } from '../../lib/utils'
import { dialogPanelActionRowClasses } from './dialog-panel.variants'

export type DialogPanelActionRowProps = React.HTMLAttributes<HTMLDivElement>

/** Canonical overlay footer action row — prefer {@link Modal.FooterActions} under Modal.Footer. */
export const DialogPanelActionRow = React.forwardRef<HTMLDivElement, DialogPanelActionRowProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-dialog-panel-action-row=""
      className={cn(dialogPanelActionRowClasses, className)}
      {...props}
    />
  ),
)
DialogPanelActionRow.displayName = 'DialogPanelActionRow'
