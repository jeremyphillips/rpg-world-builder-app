import { cn } from '../../lib/utils'

/** Left rail tone for decorative boundaries. */
export type FieldRailTone = 'border' | 'primary'

/** Horizontal offset of a decorative rail within its gutter — 8px (`left-2`). */
export const fieldRailOffsetClasses = 'left-2'

const fieldRailToneVariants = {
  border: 'before:bg-border',
  primary: 'before:bg-primary',
} satisfies Record<FieldRailTone, string>

/**
 * Decorative left rail — absolutely positioned at {@link fieldRailOffsetClasses}.
 * Does not shift dependent content. Apply on the same element as
 * {@link resolveDependentInsetClasses} so the rail sits in the gutter (e.g. `left-2`)
 * while content begins at the inset padding (e.g. `pl-9` = 8px rail gutter + 28px content offset).
 */
export function resolveFieldRailClasses(tone: FieldRailTone = 'border'): string {
  return cn(
    'relative',
    'before:absolute before:inset-y-0 before:left-2 before:w-0.5 before:rounded-full',
    fieldRailToneVariants[tone],
  )
}
