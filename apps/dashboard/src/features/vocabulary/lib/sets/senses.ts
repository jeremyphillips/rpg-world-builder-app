import { SENSE_SET_ID } from '@rpg/contracts'

import { createLabelVocabularySetHelpers, type LabelActiveVocabulary } from './label-vocabulary-set'

const helpers = createLabelVocabularySetHelpers(SENSE_SET_ID)

export type SenseVocabulary = LabelActiveVocabulary

export const buildSenseVocabulary = helpers.build
export const buildSeedSenseVocabulary = helpers.buildSeed
export const buildActiveSenseFieldOptions = helpers.buildActiveFieldOptions
export const getSenseLabelFromVocabulary = helpers.getLabel
