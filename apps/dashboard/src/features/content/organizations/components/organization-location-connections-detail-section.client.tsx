'use client'

import type { Location } from '@rpg/contracts'

import { OrganizationLocationConnectionLinkDrawer } from './organization-location-connection-link-drawer.client'
import {
  OrganizationLocationConnectionsSection,
  ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR,
} from './organization-location-connections-section.client'
import { useOrganizationLocationConnectionsDetail } from '../hooks/use-organization-location-connections-detail.client'

export function OrganizationLocationConnectionsDetailSection({
  campaignId,
  organizationId,
}: {
  campaignId: string
  organizationId: string
}) {
  const detail = useOrganizationLocationConnectionsDetail(campaignId, organizationId)

  return (
    <>
      <OrganizationLocationConnectionsSection
        locationConnections={detail.locationConnections}
        canManage={detail.canManage}
        showEmptySection={detail.canManage || detail.locationConnections.total > 0}
        isPending={detail.locationReferencesQuery.isPending}
        isError={detail.locationReferencesQuery.isError}
        errorText={ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR}
        mutationError={detail.mutationError}
        isMutationPending={detail.mutations.isPending}
        pendingConnectionId={detail.mutations.pendingConnectionId}
        onAddConnection={
          detail.canManage ? () => detail.setDrawerState({ mode: 'add' }) : undefined
        }
        onEditConnection={
          detail.canManage
            ? (connection) => detail.setDrawerState({ mode: 'edit', connection })
            : undefined
        }
        onRemoveConnection={detail.canManage ? detail.handleRemoveConnection : undefined}
      />

      {detail.canManage ? (
        <OrganizationLocationConnectionLinkDrawer
          open={detail.drawerState != null}
          onOpenChange={(open) => {
            if (!open) detail.setDrawerState(null)
          }}
          mode={detail.drawerState?.mode ?? 'add'}
          locations={detail.locations as Location[]}
          existingConnections={detail.existingConnections}
          initialConnection={
            detail.drawerState?.mode === 'edit'
              ? {
                  id: detail.drawerState.connection.connectionId,
                  locationId: detail.drawerState.connection.locationId,
                  kind: detail.drawerState.connection.kind,
                }
              : undefined
          }
          isSubmitting={detail.mutations.isPending}
          onSubmit={detail.handleSubmit}
        />
      ) : null}
    </>
  )
}
