import { cva, type VariantProps } from 'class-variance-authority'

import { fieldBorderLadderToneClasses } from './field-border-ladder.variants'
import type { FieldRhythm } from './field.variants'

/** Horizontal gutter on each side of an in-row pipe divider (`p-8` / `p-6` flanking). */
export const FIELD_ROW_DIVIDER_GUTTER_PX = {
  comfortable: 64,
  compact: 48,
} as const satisfies Record<FieldRhythm, number>

export const fieldRowDividerVariants = cva('row-span-3 w-0 shrink-0 self-stretch border-l', {
  variants: {
    tone: fieldBorderLadderToneClasses,
    rhythm: {
      comfortable: 'mx-8',
      compact: 'mx-6',
    },
  },
  defaultVariants: {
    tone: 'subtle',
    rhythm: 'comfortable',
  },
})

export type FieldRowDividerVariantProps = VariantProps<typeof fieldRowDividerVariants>

/** Inserts `auto` divider tracks between resolved field column tracks. */
export function interleaveFieldRowDividerTracks(fieldTracks: readonly string[]): string[] {
  if (fieldTracks.length <= 1) return [...fieldTracks]

  const interleaved: string[] = []
  for (let index = 0; index < fieldTracks.length; index += 1) {
    if (index > 0) interleaved.push('auto')
    interleaved.push(fieldTracks[index]!)
  }
  return interleaved
}
