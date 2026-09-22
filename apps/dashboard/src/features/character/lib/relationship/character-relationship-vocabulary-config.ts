import {
  CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY,
  CHARACTER_RESIDENCE_VOCABULARY,
  type CharacterRelationshipVocabulary,
} from './character-relationship-vocabulary'

export type CharacterRelationshipVocabularyConfig = {
  fieldName: 'organizations' | 'locations'
  heading: { label: string; hint?: string }
  addActionLabel: string
  emptyItemLabel: string
}

export const CHARACTER_RELATIONSHIP_VOCABULARY_CONFIG: Record<
  CharacterRelationshipVocabulary,
  CharacterRelationshipVocabularyConfig
> = {
  [CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY]: {
    fieldName: 'organizations',
    heading: { label: 'Organizations' },
    addActionLabel: 'Add organization',
    emptyItemLabel: 'organization',
  },
  [CHARACTER_RESIDENCE_VOCABULARY]: {
    fieldName: 'locations',
    heading: { label: 'Residence' },
    addActionLabel: 'Add residence',
    emptyItemLabel: 'residence',
  },
}
