import type { BadgeSize } from './badge.variants'
import type { GenericCardDensity } from './card.variants'

/** Title-line Badge/StatusIcon scale — separate from entity status-lane sizing. */
export function resolveHeadingAccessoryBadgeSize(
  density: GenericCardDensity = 'comfortable',
): BadgeSize {
  return density === 'spacious' ? 'md' : 'sm'
}
