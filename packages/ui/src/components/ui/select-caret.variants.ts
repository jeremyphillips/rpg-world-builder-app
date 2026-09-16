import { cva } from 'class-variance-authority'

import {
  iconGlyphDescendantClasses,
  iconGlyphRootClasses,
  type IconGlyphStep,
} from './icon-glyph.variants'
import { fieldDigitTrailingColumnClasses, type FieldSizeToken } from './field-sizing.variants'

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
 * In-flow trailing column for digit-sized Select triggers. Mirrors the number-input
 * stepper column width; shares the trigger flex row so the caret aligns with the value.
 */
export const selectDigitTrailingColumnVariants = cva(
  'pointer-events-none flex shrink-0 items-center justify-center self-stretch leading-none text-muted-foreground',
  {
    variants: {
      size: {
        sm: fieldDigitTrailingColumnClasses.sm,
        md: fieldDigitTrailingColumnClasses.md,
        lg: fieldDigitTrailingColumnClasses.lg,
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)
