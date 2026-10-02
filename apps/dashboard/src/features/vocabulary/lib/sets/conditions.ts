import { CONDITION_SET_ID } from '@rpg/contracts'

import { createLabelVocabularySetHelpers, type LabelActiveVocabulary } from './label-vocabulary-set'

const helpers = createLabelVocabularySetHelpers(CONDITION_SET_ID)

export type ConditionVocabulary = LabelActiveVocabulary

export const buildConditionVocabulary = helpers.build
export const buildSeedConditionVocabulary = helpers.buildSeed
export const buildActiveConditionFieldOptions = helpers.buildActiveFieldOptions
export const getConditionLabelFromVocabulary = helpers.getLabel
