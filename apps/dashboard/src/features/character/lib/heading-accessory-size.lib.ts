import type { BadgeSize, GenericCardDensity } from '@rpg/ui'

/** Title-line Badge/StatusIcon scale — separate from entity status-lane sizing. */
export function resolveHeadingAccessoryBadgeSize(
  density: GenericCardDensity = 'comfortable',
): BadgeSize {
  return density === 'spacious' ? 'md' : 'sm'
}
