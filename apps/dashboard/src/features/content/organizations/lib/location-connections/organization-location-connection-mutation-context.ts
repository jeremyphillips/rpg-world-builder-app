import type {
  Location,
  OrganizationLocationConnectionEdgeAtLocation,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'

import type { RelationshipCandidateSet } from '../../../lib/relationship/location-connection/location-connection-alternatives'

/** Eligibility inputs shared by org-forward list overflow and detail mutation orchestration. */
export type OrganizationLocationConnectionMutationContext = {
  subjectOrganizationId: string
  locationCandidates: RelationshipCandidateSet<Location>
  connections: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>
  edgesByLocationId?: Readonly<
    Record<string, readonly OrganizationLocationConnectionEdgeAtLocation[]>
  >
  occupancyLoaded?: boolean
}

/** Identity of an existing org→location connection being edited from the detail surface. */
export type OrganizationLocationConnectionEditTarget = {
  connectionId: string
  locationId: string
  kind: OrganizationLocationConnectionKind
}
