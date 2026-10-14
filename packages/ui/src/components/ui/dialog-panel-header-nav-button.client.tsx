'use client'

import { cn } from '../../lib/utils'
import { ActionIcon } from './action-icon.client'
import {
  dialogPanelHeaderGlyphSizeClasses,
  dialogPanelHeaderIconControlClasses,
  dialogPanelHeaderNavGlyphSizeClasses,
} from './dialog-panel-header-icon-control.lib'

export const UI_DIALOG_PANEL_HEADER_NAV_BUTTON_BLOCK_CLASS =
  'ui-dialog-panel-header-nav-button' as const

export { dialogPanelHeaderGlyphSizeClasses, dialogPanelHeaderNavGlyphSizeClasses }

/** Header back affordance — default icon hit target, not list-row compact ghost. */
export const dialogPanelHeaderNavButtonClasses = cn(
  UI_DIALOG_PANEL_HEADER_NAV_BUTTON_BLOCK_CLASS,
  dialogPanelHeaderIconControlClasses,
)

export type DialogPanelHeaderNavButtonProps = {
  'aria-label': string
  onClick: () => void
  className?: string
}

export function DialogPanelHeaderNavButton({
  'aria-label': ariaLabel,
  onClick,
  className,
}: DialogPanelHeaderNavButtonProps) {
  return (
    <button
      type="button"
      className={cn(dialogPanelHeaderNavButtonClasses, className)}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <ActionIcon action="back" step={false} className={dialogPanelHeaderGlyphSizeClasses} />
    </button>
  )
}
