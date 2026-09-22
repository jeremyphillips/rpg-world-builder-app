import { Text } from '@rpg/ui'
import type { CharacterRelationshipProjectionRow } from '@rpg/contracts'

import {
  areOrganizationMembershipProjectionsEqual,
  organizationMembershipFormRowContentEqual,
  organizationMembershipProjectionToFormRow,
  organizationMembershipProjectionsToFormValues,
  type OrganizationMembershipFormRow,
} from '../../../lib/relationship/character-relationship-form-rows.lib'
import type { OrganizationMembershipsFormValues } from '../../../lib/relationship/character-organization-memberships-form-fields'
import { useRelationshipEdgeApiSync } from '../../../lib/relationship/use-relationship-edge-api-sync'

type ApiOrganizationMembershipFormRow = OrganizationMembershipFormRow & { revision: number }

type OrganizationMembershipsApiSyncProps = {
  serverMemberships: readonly CharacterRelationshipProjectionRow[]
  onAdd: (
    organizationId: string,
    idempotencyKey: string,
  ) => Promise<{ relationshipId: string } | void>
}

/** Commits organization membership picker adds from RHF to the API sheet handlers. */
export function OrganizationMembershipsApiSync({
  serverMemberships,
  onAdd,
}: OrganizationMembershipsApiSyncProps) {
  const syncError = useRelationshipEdgeApiSync<
    OrganizationMembershipsFormValues,
    CharacterRelationshipProjectionRow,
    ApiOrganizationMembershipFormRow
  >({
    serverSnapshot: serverMemberships,
    areServerEqual: areOrganizationMembershipProjectionsEqual,
    toFormValues: (rows) =>
      organizationMembershipProjectionsToFormValues(rows) as OrganizationMembershipsFormValues,
    toSnapshotRows: (rows) => rows,
    formFieldName: 'organizations',
    getFormRows: (formValues) =>
      (formValues.organizations ?? []).map((row) => ({
        ...row,
        revision: row.revision ?? 0,
      })),
    isRowContentEqual: (confirmed, desired) =>
      organizationMembershipFormRowContentEqual(
        organizationMembershipProjectionToFormRow(confirmed),
        desired,
      ),
    onAdd: async (op, row) => {
      if (!op.idempotencyKey) {
        throw new Error('Could not add this organization membership.')
      }
      return onAdd(row.organizationId, op.idempotencyKey)
    },
    onUpdate: async () => {
      throw new Error('Could not update this organization membership.')
    },
    onRemove: async () => {
      throw new Error('Could not remove this organization membership.')
    },
    addErrorFallback: 'Could not add this organization membership.',
  })

  return syncError ? (
    <Text variant="destructive" aria-live="polite">
      {syncError}
    </Text>
  ) : null
}
