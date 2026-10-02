import { EQUIPMENT_CATEGORY_SET_ID } from '@rpg/contracts'

import { createLabelVocabularySetHelpers, type LabelActiveVocabulary } from './label-vocabulary-set'

const helpers = createLabelVocabularySetHelpers(EQUIPMENT_CATEGORY_SET_ID)

export type EquipmentCategoryVocabulary = LabelActiveVocabulary

export const buildEquipmentCategoryVocabulary = helpers.build
export const buildSeedEquipmentCategoryVocabulary = helpers.buildSeed
export const buildActiveEquipmentCategoryFieldOptions = helpers.buildActiveFieldOptions
export const getEquipmentCategoryLabelFromVocabulary = helpers.getLabel
