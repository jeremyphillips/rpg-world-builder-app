'use client'

import type { FieldBorderLadderTone } from './field-border-ladder.variants'
import { fieldRowDividerVariants } from './field-row-divider.variants'
import type { FieldRhythm } from './field.variants'

export interface FieldRowDividerProps {
  tone?: FieldBorderLadderTone
  rhythm?: FieldRhythm
}

/** Vertical pipe between anatomy-grid row siblings — spacing owned by `mx-*` on the divider. */
export function FieldRowDivider({ tone, rhythm }: FieldRowDividerProps) {
  return (
    <div
      data-field-row-divider=""
      aria-hidden
      className={fieldRowDividerVariants({ tone, rhythm })}
    />
  )
}
