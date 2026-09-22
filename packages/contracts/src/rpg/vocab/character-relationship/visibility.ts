import {
  CONTENT_VISIBILITY_MODE_ENTRIES,
  CONTENT_VISIBILITY_MODE_TERM,
  contentVisibilityModeSchema,
  type ContentVisibilityMode,
} from '../content-visibility'

/** Relationship edges reuse campaign audience visibility vocabulary. */
export const CHARACTER_RELATIONSHIP_VISIBILITY_TERM = CONTENT_VISIBILITY_MODE_TERM

export const CHARACTER_RELATIONSHIP_VISIBILITY_ENTRIES = CONTENT_VISIBILITY_MODE_ENTRIES

export const characterRelationshipVisibilitySchema = contentVisibilityModeSchema

export type CharacterRelationshipVisibility = ContentVisibilityMode

/** Default disclosure for newly created relationship edges — managers only. */
export const DEFAULT_CHARACTER_RELATIONSHIP_VISIBILITY: CharacterRelationshipVisibility = 'dm_only'
