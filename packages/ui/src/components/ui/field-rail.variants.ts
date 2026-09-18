import { cn } from '../../lib/utils'

/** Left rail tone for decorative boundaries. */
export type FieldRailTone = 'border' | 'primary'

/** Horizontal offset of a group-field decorative rail within its gutter — 8px (`left-2`). */
export const fieldRailOffsetClasses = 'left-2'

const fieldRailToneVariants = {
  border: 'before:bg-border',
  primary: 'before:bg-primary',
} satisfies Record<FieldRailTone, string>

/**
 * Decorative left rail for group field stacks — absolutely positioned at
 * {@link fieldRailOffsetClasses}. Does not shift dependent content.
 */
export function resolveFieldRailClasses(tone: FieldRailTone = 'border'): string {
  return cn(
    'relative',
    'before:absolute before:inset-y-0 before:left-2 before:w-0.5 before:rounded-full',
    fieldRailToneVariants[tone],
  )
}

/**
 * Weaker decorative rail for default dependent nests — flush left (`before:left-0`).
 */
export function resolveDependentNestRailClasses(): string {
  return cn(
    'relative',
    'before:absolute before:inset-y-0 before:left-0 before:w-px before:rounded-full before:bg-border-faint',
  )
}
