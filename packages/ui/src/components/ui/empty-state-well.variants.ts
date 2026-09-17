import { cn } from '../../lib/utils'
import { insetPanelSunkenShadowClasses } from './field-surface.lib'
import { iconGlyphRootClasses, type IconGlyphStep } from './icon-glyph.variants'
import { establishSurfaceCurrent } from './surface-current.lib'

/** Shared recessed fill for compact and large empty-state wells. */
export const emptyStateWellSurfaceClasses = cn(
  'border-border bg-sunken',
  establishSurfaceCurrent('sunken'),
  insetPanelSunkenShadowClasses,
)

/** Single-line compact copy — pairs with `EmptyPanel`. */
export const emptyStateWellBodyClasses = 'text-xs text-muted-foreground'

/** Gate / picker supporting copy. */
export const emptyStateWellSupportingClasses = 'text-sm text-muted-foreground'

/** Larger supporting copy for master-detail placeholders. */
export const emptyStateWellSupportingLgClasses = 'text-base text-muted-foreground'

/** Gate title — muted with medium weight for slight hierarchy. */
export const emptyStateWellTitleClasses = 'text-base font-medium text-muted-foreground'

/** Master-detail / heritage placeholder title. */
export const emptyStateWellTitleLgClasses = 'text-lg font-medium text-muted-foreground'

/** Decorative empty-state icons — muted ink at half strength for hierarchy below copy. */
export const emptyStateWellIconInkClasses = 'text-muted-foreground opacity-50'

/** Decorative empty-state icons (larger than the icon-glyph UI ladder). */
export const emptyStateWellIconMdClasses = cn('size-8 shrink-0', emptyStateWellIconInkClasses)

export const emptyStateWellIconLgClasses = cn('size-10 shrink-0', emptyStateWellIconInkClasses)

/** Inline empty-state icons sized on the standard glyph ladder. */
export function resolveEmptyStateWellIconClasses(step: IconGlyphStep = 'md'): string {
  return cn(iconGlyphRootClasses[step], 'shrink-0', emptyStateWellIconInkClasses)
}
