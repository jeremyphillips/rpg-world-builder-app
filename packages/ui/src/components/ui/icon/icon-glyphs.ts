import { CUSTOM_ICON_GLYPHS } from './icon-glyphs.custom'
import { LUCIDE_ICON_GLYPHS } from './icon-glyphs.lucide'

/**
 * Canonical glyphs. 112 Lucide components currently imported in the repo, plus
 * the custom `exclamation` mark (no Lucide equivalent).
 */
export const ICON_GLYPHS = {
  ...LUCIDE_ICON_GLYPHS,
  ...CUSTOM_ICON_GLYPHS,
}

export type IconName = keyof typeof ICON_GLYPHS
