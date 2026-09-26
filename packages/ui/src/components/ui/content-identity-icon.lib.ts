import type { ContentDisplayFallback } from '@rpg/contracts'

import type { AppIcon } from './app-icon.types'
import { CONTENT_DISPLAY_FALLBACK_ICONS } from './content-display-fallback-icon.map'

/** Canonical glyph for a catalog identity role — use for semantic aliases, not coincidental shares. */
export function contentIdentityIcon(key: ContentDisplayFallback): AppIcon {
  return CONTENT_DISPLAY_FALLBACK_ICONS[key]
}
