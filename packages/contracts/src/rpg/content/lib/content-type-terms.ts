import { CONTENT_TYPE_KEYS, type ContentTypeKey } from './content-type-keys'
import { SKILL_PROFICIENCY_SENTENCE } from '../../vocab/proficiency-sentence'
import { getTermSentenceForm, type VocabularyTerm } from '../../vocab/types'

export const CONTENT_TYPE_TERMS = {
  classes: {
    label: 'Class',
    description: 'Character class defining progression, proficiencies, and features.',
    sentence: {
      singular: 'class',
      plural: 'classes',
    },
  },
  spells: {
    label: 'Spell',
    description: 'Magic spell available in the ruleset catalog.',
    sentence: {
      singular: 'spell',
      plural: 'spells',
    },
  },
  species: {
    label: 'Species',
    description: 'Playable character species with traits and heritage options.',
    sentence: {
      singular: 'species',
      plural: 'species',
    },
  },
  feats: {
    label: 'Feat',
    description: 'Optional character ability or training.',
    sentence: {
      singular: 'feat',
      plural: 'feats',
    },
  },
  equipment: {
    label: 'Equipment',
    description: 'Weapons, armor, gear, and other items in the catalog.',
    sentence: {
      singular: 'equipment',
      plural: 'equipment',
    },
  },
  'skill-proficiencies': {
    label: 'Skill Proficiency',
    description: 'Training with a specific skill in the catalog.',
    sentence: SKILL_PROFICIENCY_SENTENCE,
  },
} as const satisfies Record<ContentTypeKey, VocabularyTerm>

/** Returns the catalog content-type term for a collection key. */
export function getContentTypeTerm(key: ContentTypeKey): VocabularyTerm {
  return CONTENT_TYPE_TERMS[key]
}

/** Counted noun phrase for generated prose (e.g. "species", "classes"). */
export function getContentTypeSentenceForm(key: ContentTypeKey, count = 1): string {
  return getTermSentenceForm(getContentTypeTerm(key), count)
}

export const CLASS_CONTENT_TYPE_TERM = CONTENT_TYPE_TERMS.classes
export const SPELL_CONTENT_TYPE_TERM = CONTENT_TYPE_TERMS.spells
export const SPECIES_CONTENT_TYPE_TERM = CONTENT_TYPE_TERMS.species
export const FEAT_CONTENT_TYPE_TERM = CONTENT_TYPE_TERMS.feats
export const EQUIPMENT_CONTENT_TYPE_TERM = CONTENT_TYPE_TERMS.equipment
export const SKILL_PROFICIENCY_CONTENT_TYPE_TERM = CONTENT_TYPE_TERMS['skill-proficiencies']

/** Every `ContentTypeKey` has a registered term — drift guard for new catalog types. */
export const CONTENT_TYPE_TERM_KEYS = CONTENT_TYPE_KEYS
