import {
  getContentTypeTerm,
  type FacingAttackInputField,
  type FacingCatalogCode,
} from '@rpg/contracts'

import {
  CLASS_SPELLCASTING_RULES_INCOMPLETE_GUIDANCE,
  CLASS_SPELLCASTING_RULES_PROGRESSION_UNAVAILABLE,
} from '../classes/lib/class-spellcasting-feature-rules.lib'
import {
  MONSTER_CHALLENGE_HEADING,
  MONSTER_ACTION_DAMAGE_FIELD_LABEL,
  MONSTER_ATTACK_BONUS_LABEL,
  MONSTER_EQUIPMENT_CATALOG_ERROR,
  MONSTER_LOADING_EQUIPMENT,
  MONSTER_LOADING_SPELLS,
  MONSTER_SPELL_CATALOG_ERROR,
} from '../monsters/lib/monster-form-labels'

export const MISSING_RULES_TEXT_MESSAGE = 'Add rules text to preview player-facing copy.' as const
export const MISSING_KIND_MESSAGE = 'Choose a feature kind to preview rules text.' as const
export const INCOMPLETE_TRAIT_MESSAGE =
  'Complete trait configuration to preview rules text.' as const
export const TRAIT_ADD_DETAILS_MESSAGE = 'Add trait details to preview player-facing text.' as const
export const UNSUPPORTED_KIND_MESSAGE =
  'This feature kind is not supported for rules preview.' as const
export const UNRESOLVABLE_RECORD_MESSAGE = 'This row could not be resolved for preview.' as const
export const DERIVED_CONFLICT_MESSAGE =
  'Conflicting values prevent calculating this preview.' as const
export const FACING_UNEXPECTED_MESSAGE =
  'Preview could not be calculated. Try adjusting the form and saving again.' as const
export const MISSING_SPELL_CONFIGURATION_MESSAGE =
  'Configure spellcasting details to preview this action.' as const

export const FACING_REASON_STATIC_MESSAGES = {
  'missing-action-reference': 'Referenced action unavailable.',
  'missing-rules-text': MISSING_RULES_TEXT_MESSAGE,
  'missing-kind': MISSING_KIND_MESSAGE,
  'missing-spell-configuration': MISSING_SPELL_CONFIGURATION_MESSAGE,
  'incomplete-spellcasting': CLASS_SPELLCASTING_RULES_INCOMPLETE_GUIDANCE,
  'spellcasting-progression-unavailable': CLASS_SPELLCASTING_RULES_PROGRESSION_UNAVAILABLE,
  'incomplete-trait': INCOMPLETE_TRAIT_MESSAGE,
  'derived-conflict': DERIVED_CONFLICT_MESSAGE,
  'unsupported-kind': UNSUPPORTED_KIND_MESSAGE,
  'unresolvable-record': UNRESOLVABLE_RECORD_MESSAGE,
  unexpected: FACING_UNEXPECTED_MESSAGE,
} as const

export type FacingReasonStaticCode = keyof typeof FACING_REASON_STATIC_MESSAGES

export function attackInputFieldLabel(field: FacingAttackInputField): string {
  switch (field) {
    case 'attack-bonus':
    case 'ability-score':
      return MONSTER_ATTACK_BONUS_LABEL
    case 'damage':
      return MONSTER_ACTION_DAMAGE_FIELD_LABEL
    case 'equipment':
      return getContentTypeTerm('equipment').label
    case 'challenge-rating':
      return MONSTER_CHALLENGE_HEADING
    case 'mode':
      return 'Mode'
    case 'details':
      return 'details'
  }
}

export function facingCatalogPendingMessage(catalog: FacingCatalogCode): string {
  return catalog === 'spells' ? MONSTER_LOADING_SPELLS : MONSTER_LOADING_EQUIPMENT
}

export function facingCatalogErrorMessage(catalog: FacingCatalogCode): string {
  return catalog === 'spells' ? MONSTER_SPELL_CATALOG_ERROR : MONSTER_EQUIPMENT_CATALOG_ERROR
}
