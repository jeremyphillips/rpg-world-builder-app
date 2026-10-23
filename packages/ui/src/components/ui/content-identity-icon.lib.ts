import type { ContentDisplayFallback } from '@rpg/contracts'

import { CONTENT_DISPLAY_FALLBACK_ICONS } from './content-display-fallback-icon.map'
import type { IconName } from './icon/icon-glyphs'

/** Canonical glyph name for a catalog identity role — use for semantic aliases, not coincidental shares. */
export function contentIdentityIcon(key: ContentDisplayFallback): IconName {
  return CONTENT_DISPLAY_FALLBACK_ICONS[key]
}
