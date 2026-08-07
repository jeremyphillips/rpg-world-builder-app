import type {
  LocationConnectedPartyRow,
  Organization,
  OrganizationLocationReferenceResolution,
} from '@rpg/contracts'
import { getLocationKindLabel, getOrganizationKindLabel } from '@rpg/contracts'

import {
  RELATIONSHIP_DRAWER_UNAVAILABLE_LOCATION_HEADING,
  RELATIONSHIP_DRAWER_UNAVAILABLE_ORGANIZATION_HEADING,
  type RelationshipDrawerCurrentEntitySnapshot,
} from './relationship-drawer-current-entity'

export function resolveOrganizationForwardCurrentLocationEndpoint(input: {
  connectionId: string
  locationReferences: readonly OrganizationLocationReferenceResolution[]
}): RelationshipDrawerCurrentEntitySnapshot {
  const reference = input.locationReferences.find(
    ({ connection }) => connection.id === input.connectionId,
  )

  if (!reference) {
    return {
      heading: RELATIONSHIP_DRAWER_UNAVAILABLE_LOCATION_HEADING,
      unavailable: true,
    }
  }

  if (reference.location == null) {
    return {
      heading: RELATIONSHIP_DRAWER_UNAVAILABLE_LOCATION_HEADING,
      unavailable: true,
    }
  }

  return {
    heading: reference.location.name,
    subheading: getLocationKindLabel(reference.location.kind),
    imageKey: reference.location.imageKey,
  }
}

export function resolveLocationInverseCurrentOrganizationEndpoint(input: {
  relationshipId: string
  rows: readonly LocationConnectedPartyRow[]
  organizations?: readonly Pick<Organization, 'id' | 'organizationKind' | 'imageKey'>[]
}): RelationshipDrawerCurrentEntitySnapshot {
  const row = input.rows.find(({ relationshipId }) => relationshipId === input.relationshipId)

  if (!row || row.subject.type !== 'organization') {
    return {
      heading: RELATIONSHIP_DRAWER_UNAVAILABLE_ORGANIZATION_HEADING,
      unavailable: true,
    }
  }

  const organization = input.organizations?.find(({ id }) => id === row.subject.id)

  return {
    heading: row.subject.name,
    subheading: organization ? getOrganizationKindLabel(organization.organizationKind) : undefined,
    imageKey: organization?.imageKey,
    unavailable: organization == null,
  }
}
