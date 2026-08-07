import type { LocationConnectedPartyRow, Organization } from '@rpg/contracts'
import { getOrganizationKindLabel } from '@rpg/contracts'

import {
  ENTITY_REPLACEMENT_UNAVAILABLE_ORGANIZATION_HEADING,
  type EntityReplacementCurrentSnapshot,
} from '../entity-replacement/entity-replacement-current-entity'

export function resolveLocationInverseCurrentOrganizationEndpoint(input: {
  relationshipId: string
  rows: readonly LocationConnectedPartyRow[]
  organizations?: readonly Pick<Organization, 'id' | 'organizationKind' | 'imageKey'>[]
}): EntityReplacementCurrentSnapshot {
  const row = input.rows.find(({ relationshipId }) => relationshipId === input.relationshipId)

  if (!row || row.subject.type !== 'organization') {
    return {
      heading: ENTITY_REPLACEMENT_UNAVAILABLE_ORGANIZATION_HEADING,
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
