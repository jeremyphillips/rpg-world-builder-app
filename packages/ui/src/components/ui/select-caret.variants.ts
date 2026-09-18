import {
  iconGlyphDescendantClasses,
  iconGlyphRootClasses,
  type IconGlyphStep,
} from './icon-glyph.variants'
import { selectCaretSlotClasses } from './select-compact-trigger.variants'
import type { FieldSizeToken } from './field-sizing.variants'

/** Select caret glyph step per field size — inline and digit-column share this map. */
const FIELD_SELECT_CARET_GLYPH: Record<FieldSizeToken, IconGlyphStep> = {
  sm: 'sm',
  md: 'lg',
  lg: 'lg',
}

/** Inline select caret — root Lucide class on ChevronDown inside SelectPrimitive.Icon. */
export function fieldSelectInlineCaretIconClasses(size: FieldSizeToken): string {
  return iconGlyphRootClasses[FIELD_SELECT_CARET_GLYPH[size]]
}

/** Digit-column select caret — descendant sizing on the trailing column wrapper. */
export function fieldSelectDigitColumnCaretDescendantClasses(size: FieldSizeToken): string {
  return iconGlyphDescendantClasses[FIELD_SELECT_CARET_GLYPH[size]]
}

/**
 * In-flow trailing visual slot for digit-sized Select triggers. The entire trigger
 * remains clickable — this column centers the chevron, not a separate hit target.
 *
 * @deprecated Prefer `selectCaretSlotClasses` — kept for legacy test assertions.
 */
export function selectDigitTrailingColumnVariants(
  options: { size?: FieldSizeToken; groupedStart?: boolean } = {},
): string {
  const { size = 'md', groupedStart = false } = options
  return selectCaretSlotClasses(size, { groupedStart })
}
