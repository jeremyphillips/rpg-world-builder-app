import type {
  CharacterBuildContext,
  CharacterLocationConnection,
  CharacterLocationReferenceResolution,
  CharacterOrganizationConnection,
  Location,
  Organization,
  OrganizationReferenceResolution,
} from '@rpg/contracts'

export type CharacterRelationshipFieldMode = 'draft' | 'api'

export type CharacterRelationshipFieldContext = {
  mode: CharacterRelationshipFieldMode
  campaignId?: string
  buildContext?: CharacterBuildContext
  organizationsById: Map<string, Organization>
  locationsById: Map<string, Location>
  availableOrganizationIdSet: Set<string>
  availableResidenceIdSet: Set<string>
  availableOrganizations: readonly Organization[]
  eligibleResidenceLocations: readonly Location[]
  onEditMembership?: (membership: OrganizationReferenceResolution) => void
  onRemoveUnresolvedMembership?: (membership: OrganizationReferenceResolution) => void
}

export type CharacterOrganizationMembershipEdge =
  | CharacterOrganizationConnection
  | OrganizationReferenceResolution

export type CharacterResidenceEdge =
  | CharacterLocationConnection
  | CharacterLocationReferenceResolution
