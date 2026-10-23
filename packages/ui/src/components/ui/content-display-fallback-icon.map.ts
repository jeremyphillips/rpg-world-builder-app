import type { ContentDisplayFallback } from '@rpg/contracts'

import type { IconName } from './icon/icon-glyphs'

/** Canonical semantic fallback key → glyph name (sidebar, cards, search). */
export const CONTENT_DISPLAY_FALLBACK_ICONS = {
  character: 'user-round',
  npc: 'drama',
  location: 'map-pin',
  organization: 'landmark',
  campaign: 'castle',
  equipment: 'backpack',
  class: 'book-open',
  species: 'dna',
  spell: 'sparkles',
  feat: 'medal',
  'skill-proficiency': 'list-checks',
  'game-term': 'tags',
  monster: 'skull',
  generic: 'castle',
} as const satisfies Record<ContentDisplayFallback, IconName>
