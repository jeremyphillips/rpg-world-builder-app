import type { ContentTypeConfig } from './lib/content-type-config'
import { classContentConfig } from './classes/classes.config'
import { equipmentContentConfig } from './equipment/equipment.config'
import { skillProficiencyContentConfig } from './skill-proficiencies/skill-proficiencies.config'
import { weaponsContentConfig } from './weapons/weapons.config'
import { armorContentConfig } from './armor/armor.config'

/**
 * The registry of content types. This is the single extension point: adding a
 * new content type (spells, monsters, species, equipment) means authoring its
 * `*.config.ts` and adding one entry here — the kernel handles the rest.
 */
const CONTENT_TYPES = {
  classes: classContentConfig,
  equipment: equipmentContentConfig,
  'skill-proficiencies': skillProficiencyContentConfig,
  weapons: weaponsContentConfig,
  armor: armorContentConfig,
} as const satisfies Record<string, ContentTypeConfig>

export type ContentTypeName = keyof typeof CONTENT_TYPES

export function getContentTypeConfig<K extends ContentTypeName>(
  type: K,
): (typeof CONTENT_TYPES)[K] {
  return CONTENT_TYPES[type]
}
