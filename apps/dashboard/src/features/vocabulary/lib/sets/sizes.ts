import { CREATURE_SIZE_SET_ID } from '@rpg/contracts'

import { createLabelVocabularySetHelpers, type LabelActiveVocabulary } from './label-vocabulary-set'

const helpers = createLabelVocabularySetHelpers(CREATURE_SIZE_SET_ID)

export type SizeVocabulary = LabelActiveVocabulary

export const buildSizeVocabulary = helpers.build
export const buildSeedSizeVocabulary = helpers.buildSeed
export const buildActiveSizeFieldOptions = helpers.buildActiveFieldOptions
export const getSizeLabelFromVocabulary = helpers.getLabel
