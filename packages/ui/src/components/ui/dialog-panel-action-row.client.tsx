import * as React from 'react'

import { cn } from '../../lib/utils'
import { dialogPanelActionRowClasses } from './dialog-panel.variants'

export type DialogPanelActionRowProps = React.HTMLAttributes<HTMLDivElement>

/** Canonical overlay footer action row — child of Modal.Footer / Sheet.Footer only. */
export function DialogPanelActionRow({ className, ...props }: DialogPanelActionRowProps) {
  return <div className={cn(dialogPanelActionRowClasses, className)} {...props} />
}
