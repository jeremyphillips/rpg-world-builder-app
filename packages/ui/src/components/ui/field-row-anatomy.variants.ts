import { cva, type VariantProps } from 'class-variance-authority'
import type { CSSProperties } from 'react'

import type { FieldWidth } from './field-control.variants'
import { resolveFieldRowCollapseMinWidth } from './field-row-collapse.lib'
import { resolveFieldRowColumnTracks } from './field-row-column-tracks.lib'
import { interleaveFieldRowDividerTracks } from './field-row-divider.variants'
import type { FieldRhythm } from './field.variants'

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
        none: 'gap-x-0',
      },
    },
    defaultVariants: {
      gap: 'form',
    },
  },
)

export type FieldRowAnatomyVariantProps = VariantProps<typeof fieldRowAnatomyVariants>

export type ResolveFieldRowAnatomyPresentationOptions = {
  /** When true, interleaves pipe divider columns and suppresses row gap-x. */
  fieldDivider?: boolean
  /** Rhythm for divider gutter math when `fieldDivider` is set. */
  rhythm?: FieldRhythm
}

/** Inline style + className for a schema anatomy row sized from width tokens. */
export function resolveFieldRowAnatomyPresentation(
  widths: readonly FieldWidth[],
  gap: Exclude<NonNullable<FieldRowAnatomyVariantProps['gap']>, 'none'> = 'form',
  options: ResolveFieldRowAnatomyPresentationOptions = {},
): { className: string; style: CSSProperties } {
  const { tracks, gridTemplateColumns: fieldGridTemplateColumns } =
    resolveFieldRowColumnTracks(widths)
  const gridTemplateColumns = options.fieldDivider
    ? interleaveFieldRowDividerTracks(tracks).join(' ')
    : fieldGridTemplateColumns
  const resolvedGap = options.fieldDivider ? 'none' : gap
  const collapseMinWidth = resolveFieldRowCollapseMinWidth(widths, gap, {
    fieldDivider: options.fieldDivider,
    rhythm: options.rhythm,
  })
  return {
    className: fieldRowAnatomyVariants({ gap: resolvedGap }),
    style: {
      '--row-cols': gridTemplateColumns,
      '--row-collapse-min': `${collapseMinWidth}px`,
    } as CSSProperties,
  }
}
