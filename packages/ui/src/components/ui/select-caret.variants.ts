import { selectCaretSlotClasses } from './select-compact-trigger.variants'
import type { FieldSizeToken } from './field-sizing.variants'
import type { IconSize } from './icon/icon.types'

/** Select caret glyph step per field size — inline and digit-column share this map. */
const FIELD_SELECT_CARET_ICON_SIZE: Record<FieldSizeToken, IconSize> = {
  xs: 'xs',
  sm: 'sm',
  md: 'lg',
  lg: 'lg',
}

/** Inline select caret — Icon `size` inside SelectPrimitive.Icon / select-like caret slot. */
export function fieldSelectInlineCaretIconSize(size: FieldSizeToken): IconSize {
  return FIELD_SELECT_CARET_ICON_SIZE[size]
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
