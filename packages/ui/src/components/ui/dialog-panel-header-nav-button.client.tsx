'use client'

import { cn } from '../../lib/utils'
import { ActionIcon } from './action-icon.client'
import { resolveCompactControlRecipeClasses } from './compact-control.styles'
import { interactiveFocusVariants, interactivePointerClasses } from './interactive-focus.variants'

export const UI_DIALOG_PANEL_HEADER_NAV_BUTTON_BLOCK_CLASS =
  'ui-dialog-panel-header-nav-button' as const

/** Responsive glyph sizing — tracks dialog title scale (19px → 24px from md). */
export const dialogPanelHeaderNavGlyphSizeClasses = 'size-dialog-panel-header-nav-glyph' as const

/** Header back affordance — default icon hit target, not list-row compact ghost. */
export const dialogPanelHeaderNavButtonClasses = cn(
  UI_DIALOG_PANEL_HEADER_NAV_BUTTON_BLOCK_CLASS,
  'inline-flex shrink-0 items-center justify-center rounded-sm p-0 text-muted-foreground hover:text-foreground',
  interactivePointerClasses,
  resolveCompactControlRecipeClasses('icon-default'),
  interactiveFocusVariants({ context: 'embedded' }),
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
      <ActionIcon action="back" step={false} className={dialogPanelHeaderNavGlyphSizeClasses} />
    </button>
  )
}
