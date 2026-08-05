import type { ContentTypeKey } from '../../primitives/content/content-type-keys'

/** Owner content types referenced by the cross-content projection registry. */
export const CROSS_CONTENT_OWNER_CONTENT_TYPE_KEYS = [
  'classes',
  'characters',
  'organizations',
] as const

export type CrossContentOwnerContentType = (typeof CROSS_CONTENT_OWNER_CONTENT_TYPE_KEYS)[number]

/** Target content types referenced by the cross-content projection registry. */
export const CROSS_CONTENT_TARGET_CONTENT_TYPE_KEYS = ['skill-proficiencies', 'locations'] as const

export type CrossContentTargetContentType = Extract<
  ContentTypeKey,
  'skill-proficiencies' | 'locations'
>

/** Declared cross-content relationship projections — descriptive metadata only. */
export const CROSS_CONTENT_RELATIONSHIP_PROJECTION_IDS = [
  'class_skill_proficiency_choice',
  'character_location_connection',
  'organization_location_connection',
] as const

export type CrossContentRelationshipProjectionId =
  (typeof CROSS_CONTENT_RELATIONSHIP_PROJECTION_IDS)[number]

export const CROSS_CONTENT_RELATIONSHIP_CAPABILITIES = ['read', 'write'] as const

export type CrossContentRelationshipCapability =
  (typeof CROSS_CONTENT_RELATIONSHIP_CAPABILITIES)[number]

export type CrossContentRelationshipProjectionDefinition = {
  id: CrossContentRelationshipProjectionId
  ownerContentType: CrossContentOwnerContentType
  targetContentType: CrossContentTargetContentType
  /**
   * Drift/documentation key only — never used for dynamic field traversal or
   * generic queries.
   */
  ownerField: string
  capabilities: {
    forward: CrossContentRelationshipCapability
    inverse: CrossContentRelationshipCapability
  }
}

/**
 * Minimal shared inverse-projection reference shape. Domain projections extend
 * with kind and other metadata only when meaningful.
 */
export type CrossContentProjectionReference = {
  sourceId: string
  sourceName: string
  relationshipId?: string
}

/**
 * Describes how an existing domain relationship is exposed across content
 * boundaries. Does **not** define, persist, query, or validate the relationship
 * itself — domain schemas, extractors, resolvers, and validators remain
 * domain-specific.
 */
export const CROSS_CONTENT_RELATIONSHIP_PROJECTIONS: Record<
  CrossContentRelationshipProjectionId,
  CrossContentRelationshipProjectionDefinition
> = {
  class_skill_proficiency_choice: {
    id: 'class_skill_proficiency_choice',
    ownerContentType: 'classes',
    targetContentType: 'skill-proficiencies',
    ownerField: 'characterCreation.proficiencies.skills.choices',
    capabilities: {
      forward: 'write',
      inverse: 'read',
    },
  },
  character_location_connection: {
    id: 'character_location_connection',
    ownerContentType: 'characters',
    targetContentType: 'locations',
    ownerField: 'connections.locations',
    capabilities: {
      forward: 'write',
      inverse: 'write',
    },
  },
  organization_location_connection: {
    id: 'organization_location_connection',
    ownerContentType: 'organizations',
    targetContentType: 'locations',
    ownerField: 'connections.locations',
    capabilities: {
      forward: 'write',
      inverse: 'write',
    },
  },
}

export function getCrossContentRelationshipProjection(
  id: CrossContentRelationshipProjectionId,
): CrossContentRelationshipProjectionDefinition {
  return CROSS_CONTENT_RELATIONSHIP_PROJECTIONS[id]
}

export function canInverseWriteCrossContentRelationship(
  id: CrossContentRelationshipProjectionId,
): boolean {
  return CROSS_CONTENT_RELATIONSHIP_PROJECTIONS[id].capabilities.inverse === 'write'
}
