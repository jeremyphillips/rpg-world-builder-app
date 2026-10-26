import type { GenericCardDensity } from './card.variants'

/**
 * Title-line icon actions on card and identity density.
 * Package-internal until a consumer outside `@rpg/ui` needs the same map.
 * Labeled footer and Alert actions use `resolveSurfaceActionButtonSize`.
 */
export function resolveEntityRowInlineIconActionButtonSize(
  density: GenericCardDensity = 'comfortable',
): 'icon-xs' | 'icon-sm' {
  return density === 'spacious' ? 'icon-sm' : 'icon-xs'
}
