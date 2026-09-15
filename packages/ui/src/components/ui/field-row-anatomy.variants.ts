import { cva, type VariantProps } from 'class-variance-authority'
import type { CSSProperties } from 'react'

import type { FieldWidth } from './field-control.variants'
import { resolveFieldRowCollapseMinWidth } from './field-row-collapse.lib'
import { resolveFieldRowColumnTracks } from './field-row-column-tracks.lib'

/**
 * Anatomy-grid row shell for schema `kind: 'row'` sections.
 * Column tracks come from {@link resolveFieldRowColumnTracks} (width-parity SSOT).
 */
export const fieldRowAnatomyVariants = cva(
  '@container/field-row field-row-anatomy-grid grid min-w-0 [grid-template-rows:auto_auto_auto] [grid-template-columns:var(--row-cols)]',
  {
    variants: {
      gap: {
        form: 'gap-x-6',
        compact: 'gap-x-4',
      },
    },
    defaultVariants: {
      gap: 'form',
    },
  },
)

export type FieldRowAnatomyVariantProps = VariantProps<typeof fieldRowAnatomyVariants>

/** Inline style + className for a schema anatomy row sized from width tokens. */
export function resolveFieldRowAnatomyPresentation(
  widths: readonly FieldWidth[],
  gap: NonNullable<FieldRowAnatomyVariantProps['gap']> = 'form',
): { className: string; style: CSSProperties } {
  const { gridTemplateColumns } = resolveFieldRowColumnTracks(widths)
  const collapseMinWidth = resolveFieldRowCollapseMinWidth(widths, gap)
  return {
    className: fieldRowAnatomyVariants({ gap }),
    style: {
      '--row-cols': gridTemplateColumns,
      '--row-collapse-min': `${collapseMinWidth}px`,
    } as CSSProperties,
  }
}
