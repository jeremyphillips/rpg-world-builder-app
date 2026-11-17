/**
 * Shared control-band sizing for field rows.
 *
 * Stacked fields emit flat three-region anatomy (label / control / message).
 * The control band sizes the control region; row subgrid aligns sibling regions.
 *
 * Reuses {@link FieldSizeToken} — do not introduce a parallel control-size vocabulary.
 * Heights match `fieldControlSizeClasses` (`xs` 24px / `sm` 32px / `md` 36px / `lg` 44px).
 */
import { cva, type VariantProps } from 'class-variance-authority'

import type { FieldSizeToken } from './field-sizing.variants'

export type FieldRowAlignment = 'control-edge' | 'start' | 'center' | 'stretch'
export type FieldControlBand = 'single-line' | 'content-sized'
/** `grid` is settings-style only in v1 — no multi-column label grid yet. */
export type FieldRowLayout = 'flow' | 'grid'

const singleLineMinHeights = {
  xs: 'min-h-6',
  sm: 'min-h-8',
  md: 'min-h-9',
  lg: 'min-h-11',
} as const satisfies Record<FieldSizeToken, string>

export const fieldControlBandVariants = cva('flex w-full min-w-0', {
  variants: {
    size: {
      xs: '',
      sm: '',
      md: '',
      lg: '',
    } satisfies Record<FieldSizeToken, string>,
    band: {
      'single-line': 'items-center',
      'content-sized': 'min-h-0 h-auto items-start',
    },
  },
  compoundVariants: (Object.entries(singleLineMinHeights) as [FieldSizeToken, string][]).map(
    ([size, className]) => ({
      band: 'single-line' as const,
      size,
      className,
    }),
  ),
  defaultVariants: {
    size: 'md',
    band: 'single-line',
  },
})

export type FieldControlBandVariantProps = VariantProps<typeof fieldControlBandVariants>

export const fieldRowVariants = cva('flex flex-wrap', {
  variants: {
    align: {
      'control-edge': 'items-end',
      start: 'items-start',
      center: 'items-center',
      stretch: 'items-stretch',
    } satisfies Record<FieldRowAlignment, string>,
    gap: {
      toolbar: 'gap-2',
      form: 'gap-6',
      compact: 'gap-4',
    },
    layout: {
      flow: '',
      /** Settings-style stub — same flex flow until a real multi-column row exists. */
      grid: '',
    } satisfies Record<FieldRowLayout, string>,
  },
  defaultVariants: {
    align: 'control-edge',
    gap: 'form',
    layout: 'flow',
  },
})

export type FieldRowVariantProps = VariantProps<typeof fieldRowVariants>
