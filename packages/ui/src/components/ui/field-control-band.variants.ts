/**
 * Shared control-band sizing for field rows.
 *
 * Fields in a row align by this band. Labels render above or within the band;
 * helper/validation content renders below the alignment anchor (`data-field-align`).
 *
 * Reuses {@link FieldSizeToken} — do not introduce a parallel control-size vocabulary.
 * Heights match `fieldControlSizeClasses` (`sm` 32px / `md` 36px / `lg` 44px).
 */
import { cva, type VariantProps } from 'class-variance-authority'

import type { FieldSizeToken } from './field-sizing.variants'

export type FieldRowAlignment = 'control-edge' | 'center' | 'stretch'
export type FieldControlBand = 'single-line' | 'content-sized'
/** `grid` is settings-style only in v1 — no multi-column label grid yet. */
export type FieldRowLayout = 'flow' | 'grid'

export const fieldControlBandVariants = cva('flex w-full min-w-0 items-center', {
  variants: {
    size: {
      sm: 'min-h-8',
      md: 'min-h-9',
      lg: 'min-h-11',
    } satisfies Record<FieldSizeToken, string>,
    band: {
      'single-line': '',
      'content-sized': 'min-h-0 h-auto items-start',
    },
  },
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
      center: 'items-center',
      stretch: 'items-stretch',
    } satisfies Record<FieldRowAlignment, string>,
    gap: {
      toolbar: 'gap-2',
      form: 'gap-6',
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
