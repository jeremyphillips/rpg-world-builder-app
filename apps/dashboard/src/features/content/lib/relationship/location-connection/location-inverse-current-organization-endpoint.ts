import type { LocationConnectedPartyRow, Organization } from '@rpg/contracts'
import { getOrganizationDomainLabel } from '@rpg/contracts'

import { ENTITY_UNAVAILABLE_ORGANIZATION_HEADING } from '../../entity/summary/entity-unavailable-headings.lib'
import type { EntityReplacementCurrentSnapshot } from '../../entity/surfaces/drawer/replacement/entity-replacement-current.types'

export function resolveLocationInverseCurrentOrganizationEndpoint(input: {
  relationshipId: string
  rows: readonly LocationConnectedPartyRow[]
  organizations?: readonly Pick<Organization, 'id' | 'organizationDomain' | 'imageKey'>[]
}): EntityReplacementCurrentSnapshot {
  const row = input.rows.find(({ relationshipId }) => relationshipId === input.relationshipId)

  if (!row || row.subject.type !== 'organization') {
    return {
      entity: { heading: ENTITY_UNAVAILABLE_ORGANIZATION_HEADING },
      unavailable: true,
    }
  }

  const organization = input.organizations?.find(({ id }) => id === row.subject.id)
  const kindLabel = organization
    ? getOrganizationDomainLabel(organization.organizationDomain)
    : undefined

  return {
    entity: {
      heading: row.subject.name,
      headingSuffix: kindLabel ? ` · ${kindLabel}` : undefined,
    },
    imageKey: organization?.imageKey,
    unavailable: organization == null,
  }
}
