import { CONDITION_TERM } from './effect-condition'
import { CREATURE_SIZE_TERM } from './creature-size'
import { CREATURE_TYPE_TERM } from './creature-type'
import { DAMAGE_TYPE_TERM } from './damage/vocabulary'
import { EQUIPMENT_CATEGORY_TERM } from './equipment/equipment-category'
import { LANGUAGE_TERM } from './language'
import { ATTACK_RESOLUTION_MODE_TERM } from './mechanics/attack-resolution-mode'
import { EDITION_PRESET_TERM } from './mechanics/edition-preset'
import { SENSE_TERM } from './sense'
import { SPELL_SCHOOL_TERM } from './spell/school'
import type { VocabularyTerm } from './types'
import { VOCABULARY_OPTION_SET_IDS, type VocabularyOptionSetId } from './vocabulary'
import { WEAPON_PROPERTY_TERM } from './weapon/property'

/** Taxonomy concepts for product-configurable vocabulary option sets. */
export const VOCABULARY_OPTION_SET_TERMS = {
  'creature-types': CREATURE_TYPE_TERM,
  'damage-types': DAMAGE_TYPE_TERM,
  conditions: CONDITION_TERM,
  languages: LANGUAGE_TERM,
  senses: SENSE_TERM,
  sizes: CREATURE_SIZE_TERM,
  'spell-schools': SPELL_SCHOOL_TERM,
  'weapon-properties': WEAPON_PROPERTY_TERM,
  'equipment-categories': EQUIPMENT_CATEGORY_TERM,
  'edition-presets': EDITION_PRESET_TERM,
  'attack-resolution-modes': ATTACK_RESOLUTION_MODE_TERM,
} as const satisfies Record<VocabularyOptionSetId, VocabularyTerm>

export function getVocabularyOptionSetTerm(setId: VocabularyOptionSetId): VocabularyTerm {
  return VOCABULARY_OPTION_SET_TERMS[setId]
}

/** Drift guard — every known option set id has a taxonomy term. */
export const VOCABULARY_OPTION_SET_TERM_IDS = VOCABULARY_OPTION_SET_IDS
