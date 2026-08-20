export const CONTENT_CREATE_RELATIONSHIP_VOCABULARY_IDS = [
  'organization_location_connection',
] as const

export type ContentCreateRelationshipVocabulary =
  (typeof CONTENT_CREATE_RELATIONSHIP_VOCABULARY_IDS)[number]

export type ContentCreateContext =
  | { kind: 'standalone' }
  | {
      kind: 'relationship-target'
      source: {
        contentType: 'organizations' | 'locations'
        id: string
      }
      relationshipVocabulary: ContentCreateRelationshipVocabulary
    }

export const STANDALONE_CONTENT_CREATE_CONTEXT = {
  kind: 'standalone',
} as const satisfies ContentCreateContext
