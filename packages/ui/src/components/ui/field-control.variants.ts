import { cva, type VariantProps } from 'class-variance-authority'

import {
  UI_FIELD_CONTROL_BLOCK_CLASS,
  UI_FIELD_CONTROL_TRIGGER_CLASS,
  resolveFieldControlMultilineSizeClass,
  resolveFieldControlSizeClass,
  resolveFieldControlWidthClass,
} from './field-control.styles'

/** Popover/select/combobox triggers — pointer, not text caret. */
export const fieldControlTriggerCursorClasses = 'cursor-pointer'

const fieldControlSizeClasses = {
  xs: resolveFieldControlSizeClass('xs'),
  sm: resolveFieldControlSizeClass('sm'),
  md: resolveFieldControlSizeClass('md'),
  lg: resolveFieldControlSizeClass('lg'),
} as const

const fieldTextareaSizeClasses = {
  xs: resolveFieldControlMultilineSizeClass('xs'),
  sm: resolveFieldControlMultilineSizeClass('sm'),
  md: resolveFieldControlMultilineSizeClass('md'),
  lg: resolveFieldControlMultilineSizeClass('lg'),
} as const

/**
 * Look shared by every text-like field control: border, background, focus ring,
 * disabled state, and the error treatment. The error "outline border in error
 * color" is driven by the `aria-invalid` attribute rather than a per-component
 * prop, so any control — even a hand-written one — picks it up for free once
 * `aria-invalid` is set.
 */
export const fieldControlVariants = cva(UI_FIELD_CONTROL_BLOCK_CLASS, {
  variants: {
    size: fieldControlSizeClasses,
  },
  defaultVariants: {
    size: 'md',
  },
})

export type FieldControlVariantProps = VariantProps<typeof fieldControlVariants>

/**
 * Multi-line controls (Textarea, JSON editor): the same look, but a minimum
 * height that grows with content instead of a fixed height.
 */
export const textareaVariants = cva(UI_FIELD_CONTROL_BLOCK_CLASS, {
  variants: {
    size: fieldTextareaSizeClasses,
  },
  defaultVariants: {
    size: 'md',
  },
})

export type TextareaVariantProps = VariantProps<typeof textareaVariants>

/** Standalone select/combobox trigger shell — zero padding; slots own inset. */
export function fieldControlTriggerVariants({
  size = 'md',
}: {
  size?: keyof typeof fieldControlSizeClasses
} = {}): string {
  return `${UI_FIELD_CONTROL_BLOCK_CLASS} ${UI_FIELD_CONTROL_TRIGGER_CLASS} ${resolveFieldControlSizeClass(size)} ${fieldControlTriggerCursorClasses}`
}

/** Closed vocabulary for field wrapper width tokens — see `BaseFieldConfig.width` JSDoc. */
export const FIELD_WIDTHS = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  'auto',
  'full',
  '1/2',
  '1/3',
  '2/3',
  '1/4',
  '3/4',
] as const

export type FieldWidth = (typeof FIELD_WIDTHS)[number]

/**
 * Width tokens for a field wrapper (`Field.Root`); the control inside stays
 * `w-full` to fill it. One union expresses two intents:
 *
 * - Intrinsic (`xs`–`xl`, `auto`): map to `max-width` + `flex-none` so the field
 *   keeps its own width and never grows. `xs` (~64px) suits 1–2 char inputs like
 *   a die count; `sm` suits compact inputs like level pickers. Inside a
 *   `FieldRow` (`data-field-row`), `xs`–`xl` also set matching `w-*` so the cap
 *   becomes an explicit row width (column layouts still stretch up to the cap).
 * - Proportional (`full`, fractions): flex along a `FieldRow`. `full` (default)
 *   fills the remaining space; fractions distribute it by **grow weight** rather
 *   than `flex-basis` percentages, which keeps them gap-safe and lets mixed
 *   denominators compose (weights use a base-12 scale: `1/2`→6, `1/3`→4,
 *   `2/3`→8, `1/4`→3, `3/4`→9, so e.g. `1/4 + 1/4 + 1/2` resolves to 25/25/50).
 *   Each fraction also sets a matching `max-w-*` cap so a lone fractional field
 *   in a row does not expand to the full row width.
 *
 * Fractions only compose horizontally inside a flex `FieldRow`. Outside a row,
 * `max-w-*` still caps width but `grow` follows the parent flex direction.
 */
const fieldWidthClasses = {
  xs: resolveFieldControlWidthClass('xs'),
  sm: resolveFieldControlWidthClass('sm'),
  md: resolveFieldControlWidthClass('md'),
  lg: resolveFieldControlWidthClass('lg'),
  xl: resolveFieldControlWidthClass('xl'),
  auto: resolveFieldControlWidthClass('auto'),
  full: resolveFieldControlWidthClass('full'),
  '1/2': resolveFieldControlWidthClass('1/2'),
  '1/3': resolveFieldControlWidthClass('1/3'),
  '2/3': resolveFieldControlWidthClass('2/3'),
  '1/4': resolveFieldControlWidthClass('1/4'),
  '3/4': resolveFieldControlWidthClass('3/4'),
} satisfies Record<FieldWidth, string>

export const fieldWidthVariants = cva('', {
  variants: {
    width: fieldWidthClasses,
  },
  defaultVariants: {
    width: 'full',
  },
})

export type FieldWidthVariantProps = VariantProps<typeof fieldWidthVariants>

const FIELD_WIDTH_FRACTIONS = [
  '1/2',
  '1/3',
  '2/3',
  '1/4',
  '3/4',
] as const satisfies readonly FieldWidth[]

/**
 * Resolves width classes for a field wrapper.
 *
 * When `rowParticipation` is true (anatomy-grid column), fraction tokens omit
 * `max-w-*` / flex grow — the grid track already owns sizing. Keeping flex
 * `max-w-*` would resolve percentages against the grid *cell* and double-cap
 * (e.g. half of a half-width track).
 */
export function resolveFieldWidthClassName(
  width: FieldWidth = 'full',
  options: { rowParticipation?: boolean } = {},
): string {
  if (!options.rowParticipation) {
    return fieldWidthVariants({ width })
  }

  if ((FIELD_WIDTH_FRACTIONS as readonly string[]).includes(width)) {
    return 'min-w-0 w-full'
  }

  if (width === 'full') {
    return 'min-w-0 w-full'
  }

  if (width === 'auto') {
    return 'w-fit min-w-min flex-none'
  }

  // Fixed intrinsic tokens — flex grow tokens are inert on grid items.
  return fieldWidthVariants({ width })
}
