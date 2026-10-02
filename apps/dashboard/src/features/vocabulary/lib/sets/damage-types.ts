import { DAMAGE_TYPE_SET_ID } from '@rpg/contracts'

import { createLabelVocabularySetHelpers, type LabelActiveVocabulary } from './label-vocabulary-set'

const helpers = createLabelVocabularySetHelpers(DAMAGE_TYPE_SET_ID)

export type DamageTypeVocabulary = LabelActiveVocabulary

export const buildDamageTypeVocabulary = helpers.build
export const buildSeedDamageTypeVocabulary = helpers.buildSeed
export const buildActiveDamageTypeFieldOptions = helpers.buildActiveFieldOptions
export const getDamageTypeLabelFromVocabulary = helpers.getLabel
