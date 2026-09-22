export const CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY =
  'character_organization_membership' as const

export const CHARACTER_RESIDENCE_VOCABULARY = 'character_residence' as const

export type CharacterRelationshipVocabulary =
  | typeof CHARACTER_ORGANIZATION_MEMBERSHIP_VOCABULARY
  | typeof CHARACTER_RESIDENCE_VOCABULARY
