import { WEAPON_PROPERTY_SET_ID } from '@rpg/contracts'

import { createLabelVocabularySetHelpers, type LabelActiveVocabulary } from './label-vocabulary-set'

const helpers = createLabelVocabularySetHelpers(WEAPON_PROPERTY_SET_ID)

export type WeaponPropertyVocabulary = LabelActiveVocabulary

export const buildWeaponPropertyVocabulary = helpers.build
export const buildSeedWeaponPropertyVocabulary = helpers.buildSeed
export const buildActiveWeaponPropertyFieldOptions = helpers.buildActiveFieldOptions
export const getWeaponPropertyLabelFromVocabulary = helpers.getLabel
