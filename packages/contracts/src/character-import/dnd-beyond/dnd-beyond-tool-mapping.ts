import type { ToolCategory } from '../../rpg/vocab/equipment/tool-category'

// ---------------------------------------------------------------------------
// D&D Beyond tool subtype → local catalog tool mapping (SRD 5.2.1).
// Slugs align with packages/catalog equipment tool.json entries.
// ---------------------------------------------------------------------------

export const DND_BEYOND_SRD_TOOL_RULESET_ID = 'srd-cc-5.2.1' as const

export const DND_BEYOND_TOOL_SUBTYPE_TO_CATEGORY = {
  'alchemists-supplies': 'artisan',
  bagpipes: 'musical_instrument',
  'brewers-supplies': 'artisan',
  'calligraphers-supplies': 'artisan',
  'carpenters-tools': 'artisan',
  'cartographers-tools': 'artisan',
  'cobblers-tools': 'artisan',
  'cooks-utensils': 'artisan',
  dice: 'gaming_set',
  'disguise-kit': 'other',
  dragonchess: 'gaming_set',
  drum: 'musical_instrument',
  dulcimer: 'musical_instrument',
  flute: 'musical_instrument',
  'forgery-kit': 'other',
  'glassblowers-tools': 'artisan',
  'herbalism-kit': 'other',
  horn: 'musical_instrument',
  'jewelers-tools': 'artisan',
  'leatherworkers-tools': 'artisan',
  lute: 'musical_instrument',
  lyre: 'musical_instrument',
  'masons-tools': 'artisan',
  'navigators-tools': 'navigator',
  'painters-supplies': 'artisan',
  'pan-flute': 'musical_instrument',
  'playing-cards': 'gaming_set',
  'poisoners-kit': 'other',
  'potters-tools': 'artisan',
  shawm: 'musical_instrument',
  'smiths-tools': 'artisan',
  'thieves-tools': 'thieves',
  'three-dragon-ante': 'gaming_set',
  'tinkers-tools': 'artisan',
  viol: 'musical_instrument',
  'weavers-tools': 'artisan',
  'woodcarvers-tools': 'artisan',
} as const satisfies Record<string, ToolCategory>

export type DndBeyondMappedToolSubtype = keyof typeof DND_BEYOND_TOOL_SUBTYPE_TO_CATEGORY

export type DndBeyondToolMapping = {
  toolId: string
  toolCategory: ToolCategory
}

export function mapDndBeyondToolSubtype(subType: string): DndBeyondToolMapping | undefined {
  const normalized = subType.trim().toLowerCase()
  const toolCategory = DND_BEYOND_TOOL_SUBTYPE_TO_CATEGORY[normalized as DndBeyondMappedToolSubtype]
  if (!toolCategory) return undefined

  return {
    toolId: `${DND_BEYOND_SRD_TOOL_RULESET_ID}:${normalized}`,
    toolCategory,
  }
}
