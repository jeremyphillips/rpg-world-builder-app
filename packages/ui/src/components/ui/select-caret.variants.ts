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
