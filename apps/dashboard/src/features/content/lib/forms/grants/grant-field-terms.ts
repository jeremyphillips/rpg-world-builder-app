import {
  CONTENT_TYPE_TERMS,
  DAMAGE_TYPE_TERM,
  EQUIPMENT_KIND_ENTRIES,
  FEAT_CATEGORY_TERM,
  fieldValidationMessages,
  getTermSentenceForm,
  LANGUAGE_TERM,
  MOVEMENT_MODE_TERM,
  MOVEMENT_OPERATION_TERM,
  SENSE_TERM,
  type VocabularyTerm,
} from '@rpg/contracts'

import { vocabularyFieldLabel } from '@/features/vocabulary'

/** Plain skill noun for grant selection validation (not "skill proficiency"). */
export const GRANT_SKILL_SELECTION_TERM = {
  label: 'Skill',
  description: 'A character skill selected for a proficiency grant.',
  sentence: {
    singular: 'skill',
    plural: 'skills',
  },
} as const satisfies VocabularyTerm

/** Contextual movement grant labels without a dedicated taxonomy term. */
export const GRANT_MOVEMENT_SPEED_LABEL = 'Movement speed'
export const GRANT_MOVEMENT_MATCH_MODE_LABEL = 'Movement mode to match'

/** Vocab-backed nouns shared by grant field configs and schema refinements. */
export const GRANT_FIELD_TERMS = {
  resistances: DAMAGE_TYPE_TERM,
  damageType: DAMAGE_TYPE_TERM,
  senseType: SENSE_TERM,
  language: LANGUAGE_TERM,
  featCategory: FEAT_CATEGORY_TERM,
  movementMode: MOVEMENT_MODE_TERM,
  movementOperation: MOVEMENT_OPERATION_TERM,
  toolProficiencySlugs: EQUIPMENT_KIND_ENTRIES.tool,
  weaponProficiencySlugs: EQUIPMENT_KIND_ENTRIES.weapon,
  armorTrainingSlugs: EQUIPMENT_KIND_ENTRIES.armor,
  skillProficiencyIds: GRANT_SKILL_SELECTION_TERM,
  spellIds: CONTENT_TYPE_TERMS.spells,
} as const satisfies Record<string, VocabularyTerm>

export type GrantFieldTermKey = keyof typeof GRANT_FIELD_TERMS

/** Sentence-case field label from the grant term map. */
export function grantFieldLabel(key: GrantFieldTermKey, options?: { plural?: boolean }): string {
  const term = GRANT_FIELD_TERMS[key]
  if (key === 'armorTrainingSlugs') {
    return 'Armor'
  }
  return vocabularyFieldLabel(term, options)
}

/** Tier-1 required single-select message from a grant term. */
export function grantFieldRequiredSelectMessage(key: GrantFieldTermKey): string {
  return fieldValidationMessages.requiredSelect({ label: grantFieldLabel(key) })
}

/** Tier-1 min-selection message from a grant term. */
export function grantFieldMinSelectionsMessage(key: GrantFieldTermKey): string {
  return fieldValidationMessages.minSelections({
    itemLabel: getTermSentenceForm(GRANT_FIELD_TERMS[key], 1),
  })
}
