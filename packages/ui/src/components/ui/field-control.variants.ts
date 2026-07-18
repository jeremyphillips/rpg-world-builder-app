import { cva, type VariantProps } from 'class-variance-authority'

import { fieldControlSizeClasses, fieldTextareaSizeClasses } from './field-sizing.variants'
import {
  fieldInputAutofillClasses,
  fieldInputDisabledClasses,
  fieldInputFocusClasses,
  fieldInputInvalidAriaClasses,
  fieldInputPlaceholderClasses,
  fieldInputReadonlyClasses,
  fieldInputShellClasses,
} from './field-input-chrome.variants'

/**
 * Look shared by every text-like field control: border, background, focus ring,
 * disabled state, and the error treatment. The error "outline border in error
 * color" is driven by the `aria-invalid` attribute rather than a per-component
 * prop, so any control — even a hand-written one — picks it up for free once
 * `aria-invalid` is set.
 */
const fieldControlBase = [
  'flex w-full',
  fieldInputShellClasses,
  fieldInputPlaceholderClasses,
  fieldInputFocusClasses,
  fieldInputInvalidAriaClasses,
  fieldInputDisabledClasses,
  fieldInputReadonlyClasses,
  fieldInputAutofillClasses,
].join(' ')

/**
 * Single-line controls (Input, the Select trigger): a fixed height per size.
 */
export const fieldControlVariants = cva(fieldControlBase, {
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
export const textareaVariants = cva(fieldControlBase, {
  variants: {
    size: fieldTextareaSizeClasses,
  },
  defaultVariants: {
    size: 'md',
  },
})

export type TextareaVariantProps = VariantProps<typeof textareaVariants>

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
  xs: 'max-w-16 flex-none in-data-[field-row]:w-16',
  sm: 'max-w-24 flex-none in-data-[field-row]:w-24',
  md: 'max-w-36 flex-none in-data-[field-row]:w-36',
  lg: 'max-w-48 flex-none in-data-[field-row]:w-48',
  xl: 'max-w-64 flex-none in-data-[field-row]:w-64',
  auto: 'w-fit flex-none',
  full: 'w-full flex-1',
  '1/2': 'min-w-0 max-w-1/2 basis-0 grow-[6]',
  '1/3': 'min-w-0 max-w-1/3 basis-0 grow-[4]',
  '2/3': 'min-w-0 max-w-2/3 basis-0 grow-[8]',
  '1/4': 'min-w-0 max-w-1/4 basis-0 grow-[3]',
  '3/4': 'min-w-0 max-w-3/4 basis-0 grow-[9]',
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
