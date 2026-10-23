import { cn } from '../../lib/utils'
import { insetPanelSunkenShadowClasses } from './field-surface.lib'
import { establishSurfaceCurrent } from './surface-current.lib'

/** Shared recessed fill for compact and large empty-state wells. */
export const emptyStateWellSurfaceClasses = cn(
  'border-border bg-sunken',
  establishSurfaceCurrent('sunken'),
  insetPanelSunkenShadowClasses,
)

/** Passive single-message copy in compact wells (`EmptyPanel`). */
export const emptyStateWellPassiveMessageClasses = 'text-style-caption italic'

/**
 * Italic emphasis for passive copy that scales with inset panel size
 * (`InsetPanel.PassiveMessage`). Pairs with `Text` size variants — not a standalone recipe.
 */
export const emptyStateWellPassiveMessageEmphasisClasses = 'italic'

/** @deprecated Use `emptyStateWellPassiveMessageClasses`. */
export const emptyStateWellBodyClasses = emptyStateWellPassiveMessageClasses

/** Instructional or explanatory copy under a structured title — roman. */
export const emptyStateWellSupportingClasses = 'text-style-supporting'

/** Larger supporting copy for master-detail placeholders. */
export const emptyStateWellSupportingLgClasses = 'text-base text-muted-foreground'

/** Structured empty-state title — emphasized, roman (may precede supporting copy). */
export const emptyStateWellTitleClasses = 'text-base font-medium text-muted-foreground'

/** Larger structured empty-state title (master-detail, heritage, …). */
export const emptyStateWellTitleLgClasses = 'text-lg font-medium text-muted-foreground'

/** Decorative empty-state icons — muted ink at half strength for hierarchy below copy. */
export const emptyStateWellIconInkClasses = 'text-muted-foreground opacity-50'

/** Owner-sized empty-state icon (32px) — pair with `Icon` `size="owner"`. */
export const emptyStateWellIconMdClasses = cn(
  'ui-empty-state-well__icon ui-empty-state-well__icon--md shrink-0',
  emptyStateWellIconInkClasses,
)

/** Owner-sized empty-state icon (40px) — pair with `Icon` `size="owner"`. */
export const emptyStateWellIconLgClasses = cn(
  'ui-empty-state-well__icon ui-empty-state-well__icon--lg shrink-0',
  emptyStateWellIconInkClasses,
)
