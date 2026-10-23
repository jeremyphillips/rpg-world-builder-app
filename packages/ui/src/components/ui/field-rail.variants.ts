import { cn } from '../../lib/utils'
import { borderStrength } from './border-strength'

/** Neutral structural rail vs brand accent. */
export type FieldRailTone = 'neutral' | 'primary'

/**
 * Decorative left rail for group field stacks — absolutely positioned with
 * inline-start gutter offset. Does not shift dependent content.
 */
export function resolveFieldRailClasses(tone: FieldRailTone = 'neutral'): string {
  return cn(
    'ui-field-rail',
    tone === 'primary'
      ? 'ui-field-rail--tone-primary'
      : cn('ui-border--default', 'ui-field-rail--tone-neutral'),
  )
}

/**
 * Weaker decorative rail for default dependent nests — flush inline-start.
 */
export function resolveDependentNestRailClasses(): string {
  return cn('ui-field-rail-nest', borderStrength('subtle'))
}
