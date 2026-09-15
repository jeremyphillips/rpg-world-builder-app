import { cva, type VariantProps } from 'class-variance-authority'

import type { FieldWidth } from './field-control.variants'
import { resolveFieldRowColumnTracks } from './field-row-column-tracks.lib'

/**
 * Anatomy-grid row shell for Storybook prototypes.
 * Column tracks come from {@link resolveFieldRowColumnTracks} (width-parity SSOT).
 */
export const fieldRowAnatomyPrototypeVariants = cva(
  'grid min-w-0 [grid-template-rows:auto_auto_auto] [grid-template-columns:var(--row-cols)]',
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

export type FieldRowAnatomyPrototypeVariantProps = VariantProps<
  typeof fieldRowAnatomyPrototypeVariants
>

/** Inline style + className for an anatomy prototype row sized from width tokens. */
export function resolveFieldRowAnatomyPrototypePresentation(
  widths: readonly FieldWidth[],
  gap: NonNullable<FieldRowAnatomyPrototypeVariantProps['gap']> = 'form',
): { className: string; style: { '--row-cols': string } } {
  const { gridTemplateColumns } = resolveFieldRowColumnTracks(widths)
  return {
    className: fieldRowAnatomyPrototypeVariants({ gap }),
    style: { '--row-cols': gridTemplateColumns },
  }
}
