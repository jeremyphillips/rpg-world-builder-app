import { getSpellAtomicEffectKindLabel } from '@rpg/contracts'

/** Neutral effect-row copy. Consumers keep their own section headings. */
export const EFFECT_DAMAGE_LABEL = getSpellAtomicEffectKindLabel('damage')
export const EFFECT_NOTE_LABEL = 'Note'
export const EFFECT_ADD_LABEL = 'Add effect'
export const EFFECT_DETAILS_LABEL = 'Details'
export const EFFECT_CONDITION_DETAILS_HINT =
  'Additional rules or restrictions that apply to this effect.'
export const EFFECT_CONDITION_DETAILS_PLACEHOLDER = 'E.g. (escape DC 15), from both claws'
export const EFFECT_REPLACE_CONDITION_ADD_LABEL = 'Replace condition'
export const EFFECT_REPLACE_CONDITION_REMOVE_LABEL = 'Clear condition replacement'
export const EFFECT_DAMAGE_AMOUNT_LABEL = 'Damage amount'
