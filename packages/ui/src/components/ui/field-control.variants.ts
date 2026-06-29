import { cva, type VariantProps } from 'class-variance-authority'

import { fieldControlSizeClasses, fieldTextareaSizeClasses } from './field-sizing.variants'

/**
 * Look shared by every text-like field control: border, background, focus ring,
 * disabled state, and the error treatment. The error "outline border in error
 * color" is driven by the `aria-invalid` attribute rather than a per-component
 * prop, so any control — even a hand-written one — picks it up for free once
 * `aria-invalid` is set.
 */
const fieldControlBase =
  'flex w-full rounded-md border border-input bg-transparent shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive dark:bg-input/30'

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

/**
 * Width tokens for a field wrapper (`Field.Root`); the control inside stays
 * `w-full` to fill it. One union expresses two intents:
 *
 * - Intrinsic (`xs`–`xl`, `auto`): map to `max-width` + `flex-none` so the field
 *   keeps its own width and never grows. `xs` (~64px) suits 1–2 char inputs like
 *   a die count; `sm` suits compact inputs like level pickers.
 * - Proportional (`full`, fractions): flex along a `FieldRow`. `full` (default)
 *   fills the remaining space; fractions distribute it by **grow weight** rather
 *   than `flex-basis` percentages, which keeps them gap-safe and lets mixed
 *   denominators compose (weights use a base-12 scale: `1/2`→6, `1/3`→4,
 *   `2/3`→8, `1/4`→3, `3/4`→9, so e.g. `1/4 + 1/4 + 1/2` resolves to 25/25/50).
 *
 * Fractions only have meaning inside a flex `FieldRow`; outside one they behave
 * like `full`.
 */
export const fieldWidthVariants = cva('', {
  variants: {
    width: {
      xs: 'max-w-16 flex-none',
      sm: 'max-w-24 flex-none',
      md: 'max-w-36 flex-none',
      lg: 'max-w-48 flex-none',
      xl: 'max-w-64 flex-none',
      auto: 'w-fit flex-none',
      full: 'w-full flex-1',
      '1/2': 'basis-0 grow-[6]',
      '1/3': 'basis-0 grow-[4]',
      '2/3': 'basis-0 grow-[8]',
      '1/4': 'basis-0 grow-[3]',
      '3/4': 'basis-0 grow-[9]',
    },
  },
  defaultVariants: {
    width: 'full',
  },
})

export type FieldWidthVariantProps = VariantProps<typeof fieldWidthVariants>
export type FieldWidth = NonNullable<FieldWidthVariantProps['width']>
