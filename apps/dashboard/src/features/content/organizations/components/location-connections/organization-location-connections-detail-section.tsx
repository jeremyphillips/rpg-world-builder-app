import type { Location, Organization } from '@rpg/contracts'

import { OrganizationLocationConnectionLinkDrawer } from './organization-location-connection-link-drawer'
import {
  OrganizationLocationConnectionsSection,
  ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR,
} from './organization-location-connections-section'
import { useOrganizationLocationConnectionsDetail } from '../../hooks/use-organization-location-connections-detail'

// fallow-ignore-next-line complexity
export function OrganizationLocationConnectionsDetailSection({
  campaignId,
  organization,
}: {
  campaignId: string
  organization: Organization
}) {
  const detail = useOrganizationLocationConnectionsDetail(campaignId, organization.id, organization)

  return (
    <>
      <OrganizationLocationConnectionsSection
        locationConnections={detail.locationConnections}
        visibleFamilies={detail.visibleFamilies}
        canAddToFamily={detail.canAddToFamily}
        canManage={detail.canManage}
        showEmptySection={detail.canManage || detail.locationConnections.total > 0}
        isPending={detail.locationReferencesQuery.isPending}
        isError={detail.locationReferencesQuery.isError}
        errorText={ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR}
        mutationError={detail.mutationError}
        isMutationPending={detail.mutations.isPending}
        pendingConnectionId={detail.mutations.pendingConnectionId}
        onAddFamily={detail.canManage ? detail.openAddFamily : undefined}
        onChangeKindConnection={detail.canManage ? detail.openChangeKindDrawer : undefined}
        onChangeTargetConnection={detail.canManage ? detail.openChangeTargetDrawer : undefined}
        onRemoveConnection={detail.canManage ? detail.handleRemoveConnection : undefined}
        mutationContext={detail.mutationContext}
      />

      {detail.canManage && detail.drawerState ? (
        <OrganizationLocationConnectionLinkDrawer
          open={detail.drawerState != null}
          onOpenChange={(open) => {
            if (!open) detail.setDrawerState(null)
          }}
          mode={detail.drawerState.mode}
          intent={detail.drawerState.intent}
          addKind={detail.drawerState.mode === 'add' ? detail.drawerState.kind : undefined}
          organization={organization}
          organizationId={organization.id}
          campaignId={campaignId}
          locations={detail.locations as Location[]}
          locationsById={detail.locationsById}
          locationCandidates={detail.mutationContext.locationCandidates}
          existingConnections={detail.existingConnections}
          edgesByLocationId={detail.edgesByLocationId}
          occupancyLoaded={detail.occupancyLoaded}
          initialConnection={
            detail.drawerState.mode === 'changeKind' || detail.drawerState.mode === 'changeTarget'
              ? {
                  id: detail.drawerState.connection.connectionId,
                  locationId: detail.drawerState.connection.locationId,
                  kind: detail.drawerState.connection.kind,
                }
              : undefined
          }
          drawerAlternatives={
            detail.drawerState.mode === 'changeKind' || detail.drawerState.mode === 'changeTarget'
              ? detail.resolveDrawerAlternatives(detail.drawerState.connection)
              : undefined
          }
          isSubmitting={detail.mutations.isPending}
          currentEndpoint={
            detail.drawerState.mode === 'changeTarget'
              ? detail.changeTargetCurrentEndpoint
              : undefined
          }
          onSubmit={detail.handleSubmit}
        />
      ) : null}
    </>
  )
}
