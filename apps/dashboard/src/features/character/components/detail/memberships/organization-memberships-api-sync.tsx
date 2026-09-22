import type { OrganizationReferenceResolution } from '@rpg/contracts'

import type { OrganizationMembershipSelection } from '../../connections/picker/organization-picker-drawer.types'
import {
  areOrganizationMembershipListsEqual,
  organizationMembershipsToFormValues,
  type OrganizationMembershipsFormValues,
} from '../../../lib/relationship/character-organization-memberships-form-fields'
import { useRelationshipApiSemanticSync } from '../../../lib/relationship/use-relationship-api-semantic-sync'

type OrganizationMembershipsApiSyncProps = {
  serverMemberships: readonly OrganizationReferenceResolution[]
  onAdd: (selection: OrganizationMembershipSelection) => void | Promise<void>
}

/** Commits organization membership picker adds from RHF to the API sheet handlers. */
export function OrganizationMembershipsApiSync({
  serverMemberships,
  onAdd,
}: OrganizationMembershipsApiSyncProps) {
  return useRelationshipApiSemanticSync<
    OrganizationMembershipsFormValues,
    OrganizationReferenceResolution
  >({
    serverSnapshot: serverMemberships,
    areServerEqual: areOrganizationMembershipListsEqual,
    toFormValues: organizationMembershipsToFormValues,
    formFieldName: 'organizations',
    semanticIdKey: 'organizationId',
    getConfirmedIds: (memberships) => memberships.map((membership) => membership.organizationId),
    onAdd: (organizationId) => onAdd({ organizationId }),
    addErrorFallback: 'Could not add this organization membership.',
  })
}
