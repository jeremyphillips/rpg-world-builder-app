import type {
  CharacterBuildContext,
  CharacterLocationReferenceResolution,
  Location,
  Organization,
} from '@rpg/contracts'

import type { CharacterLocationsQueryStatus } from './character-locations-query-status.lib'
import type {
  OrganizationMembershipFormRow,
  OrganizationMembershipSheetRow,
  ResidenceFormRow,
} from './character-relationship-form-rows.lib'

export type {
  OrganizationMembershipFormRow,
  OrganizationMembershipSheetRow,
  ResidenceFormRow,
} from './character-relationship-form-rows.lib'

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
  onEditMembership?: (membership: OrganizationMembershipSheetRow) => void
  onRemoveUnresolvedMembership?: (membership: OrganizationMembershipSheetRow) => void
  /** Server-resolved memberships for API trailing actions (edit / unresolved remove). */
  resolvedMemberships?: readonly OrganizationMembershipSheetRow[]
}

export type CharacterOrganizationMembershipEdge =
  | OrganizationMembershipFormRow
  | OrganizationMembershipSheetRow

export type CharacterResidenceEdge = ResidenceFormRow | CharacterLocationReferenceResolution
