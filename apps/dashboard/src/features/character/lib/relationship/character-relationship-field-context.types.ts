import type {
  CharacterBuildContext,
  CharacterLocationConnection,
  CharacterLocationReferenceResolution,
  CharacterOrganizationConnection,
  Location,
  Organization,
  OrganizationReferenceResolution,
} from '@rpg/contracts'

import type { CharacterLocationsQueryStatus } from './character-locations-query-status.lib'

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
  locationsQueryStatus: CharacterLocationsQueryStatus
  onEditMembership?: (membership: OrganizationReferenceResolution) => void
  onRemoveUnresolvedMembership?: (membership: OrganizationReferenceResolution) => void
  /** Server-resolved memberships for API trailing actions (edit / unresolved remove). */
  resolvedMemberships?: readonly OrganizationReferenceResolution[]
}

export type CharacterOrganizationMembershipEdge =
  | CharacterOrganizationConnection
  | OrganizationReferenceResolution

export type CharacterResidenceEdge =
  | CharacterLocationConnection
  | CharacterLocationReferenceResolution
