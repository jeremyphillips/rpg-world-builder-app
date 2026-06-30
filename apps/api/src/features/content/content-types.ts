import type { HomebrewSummaryContentType } from '@rpg/contracts'
import type { ContentTypeConfig } from './lib/content-type-config'
import { classContentConfig } from './classes/classes.config'
import { equipmentContentConfig } from './equipment/equipment.config'
import { skillProficiencyContentConfig } from './skill-proficiencies/skill-proficiencies.config'
import { speciesContentConfig } from './species/species.config'
import { spellContentConfig } from './spells/spells.config'
import { featContentConfig } from './feats/feats.config'
import { startingWealthContentConfig } from './starting-wealth/starting-wealth.config'

/**
 * The registry of content types. This is the single extension point: adding a
 * new content type (spells, monsters, species, equipment) means authoring its
 * `*.config.ts` and adding one entry here — the kernel handles the rest.
 */
const CONTENT_TYPES = {
  classes: classContentConfig,
  equipment: equipmentContentConfig,
  'skill-proficiencies': skillProficiencyContentConfig,
  species: speciesContentConfig,
  spells: spellContentConfig,
  feats: featContentConfig,
  'starting-wealth': startingWealthContentConfig,
} as const satisfies Record<string, ContentTypeConfig>

export type ContentTypeName = keyof typeof CONTENT_TYPES

/** Content types included in the homebrew hub summary (excludes starting-wealth). */
export const HOMEBREW_SUMMARY_TYPES = [
  'classes',
  'spells',
  'species',
  'feats',
  'equipment',
  'skill-proficiencies',
] as const satisfies readonly HomebrewSummaryContentType[]

export function getContentTypeConfig<K extends ContentTypeName>(
  type: K,
): (typeof CONTENT_TYPES)[K] {
  return CONTENT_TYPES[type]
}
