import type { BadgeSize } from './badge.variants'
import type { GenericCardDensity } from './card.variants'

/** Inline badges on entity/card rows (title accessories, status lane, metadata composition). */
export function resolveEntityRowInlineBadgeSize(
  density: GenericCardDensity = 'comfortable',
): BadgeSize {
  return density === 'spacious' ? 'md' : 'sm'
}
