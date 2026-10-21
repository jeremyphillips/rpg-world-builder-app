import type { BadgeSize } from './badge.variants'
import type { GenericCardDensity } from './card.variants'

import { resolveEntityRowInlineBadgeSize } from './entity-row-inline-badge-size.lib'

/** @deprecated Use `resolveEntityRowInlineBadgeSize`. */
export function resolveHeadingAccessoryBadgeSize(
  density: GenericCardDensity = 'comfortable',
): BadgeSize {
  return resolveEntityRowInlineBadgeSize(density)
}
