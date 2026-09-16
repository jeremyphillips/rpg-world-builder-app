import type { FieldWidth } from './field-control.variants'
import {
  fieldRowAnatomyVariants,
  resolveFieldRowAnatomyPresentation,
  type FieldRowAnatomyVariantProps,
} from './field-row-anatomy.variants'

/** @deprecated Use {@link fieldRowAnatomyVariants} — prototype alias retained for stories. */
export const fieldRowAnatomyPrototypeVariants = fieldRowAnatomyVariants

export type FieldRowAnatomyPrototypeVariantProps = FieldRowAnatomyVariantProps

/** @deprecated Use {@link resolveFieldRowAnatomyPresentation}. */
export function resolveFieldRowAnatomyPrototypePresentation(
  widths: readonly FieldWidth[],
  gap: NonNullable<FieldRowAnatomyPrototypeVariantProps['gap']> = 'form',
) {
  return resolveFieldRowAnatomyPresentation(widths, gap)
}
