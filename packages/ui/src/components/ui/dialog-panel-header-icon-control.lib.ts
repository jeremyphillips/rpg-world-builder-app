import { cn } from '../../lib/utils'
import { resolveCompactControlRecipeClasses } from './compact-control.styles'
import { interactiveFocusVariants, interactivePointerClasses } from './interactive-focus.variants'

/** Responsive glyph sizing for dialog panel header icon controls (19px → 24px from md). */
export const dialogPanelHeaderGlyphSizeClasses = 'size-dialog-panel-header-glyph' as const

/** @deprecated Use {@link dialogPanelHeaderGlyphSizeClasses}. */
export const dialogPanelHeaderNavGlyphSizeClasses = dialogPanelHeaderGlyphSizeClasses

/**
 * Shared chrome for header back and panel dismiss — `icon-default` hit target, embedded focus.
 */
export const dialogPanelHeaderIconControlClasses = cn(
  'inline-flex shrink-0 items-center justify-center rounded-sm p-0 text-muted-foreground hover:text-foreground',
  interactivePointerClasses,
  resolveCompactControlRecipeClasses('icon-default'),
  interactiveFocusVariants({ context: 'embedded' }),
)
