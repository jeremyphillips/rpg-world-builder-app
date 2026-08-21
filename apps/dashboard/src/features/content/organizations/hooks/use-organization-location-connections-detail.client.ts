'use client'

import * as React from 'react'

import type {
  Organization,
  OrganizationLocationConnectionFamily,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import { ApiError } from '@rpg/contracts'

import { useCanManageCampaign } from '@/features/campaign'

import { filterReferenceableCatalogRows } from '../../lib/form-options/content-reference-catalog.lib'
import { useLocations } from '../../locations/hooks/use-locations'
import { buildLocationsById } from '../../locations/lib/location-display'
import {
  organizationConnectionDrawerIntentFromFamily,
  organizationForwardFamilyHasAvailableTarget,
  organizationDrawerIntentFromKind,
  resolveVisibleOrganizationConnectionFamilies,
  type OrganizationConnectionDrawerIntent,
} from '../../lib/relationship/location-connection/location-connection-drawer-intent'
import { LOCATION_CONNECTION_KIND_OPTIONS_COPY } from '../../locations/lib/connected-parties/location-connection-kind-options-copy.lib'
import { resolveRelationshipAlternatives } from '../../lib/relationship/location-connection/location-connection-alternatives'
import type { OrganizationForwardDrawerMode } from '../../lib/relationship/location-connection/location-connection-mutation-mode'
import { useCampaignOrganizationLocationConnectionEdges } from './use-campaign-organization-location-connection-edges'
import { useOrganizationLocationConnectionMutations } from './use-organization-location-connection-mutations'
import { useOrganizationLocationReferences } from './use-organization-location-references'
import {
  buildOrganizationLocationConnectionCards,
  resolveOrganizationForwardCurrentLocationEndpoint,
} from '../lib/location-connections/build-organization-location-connection-cards'
import { ORGANIZATION_EMPTY_SECTION_TEXT } from '../lib/organization-display'
import type {
  OrganizationLocationConnectionEditTarget,
  OrganizationLocationConnectionMutationContext,
} from '../lib/location-connections/organization-location-connection-mutation-context'
import { ORGANIZATION_LOCATION_CONNECTION_MUTATION_ERROR } from '../lib/location-connections/organization-location-connection-surface-copy'

type EditDrawerState = {
  mode: Extract<OrganizationForwardDrawerMode, 'changeKind' | 'changeTarget'>
  intent: OrganizationConnectionDrawerIntent
  connection: OrganizationLocationConnectionEditTarget
}

type DrawerState =
  | {
      mode: 'add'
      intent: OrganizationConnectionDrawerIntent
      kind?: OrganizationLocationConnectionKind
    }
  | EditDrawerState

export function useOrganizationLocationConnectionsDetail(
  campaignId: string,
  organizationId: string,
  organization: Pick<Organization, 'name' | 'organizationDomain'>,
) {
  const canManage = useCanManageCampaign(campaignId)
  const locationsQuery = useLocations(campaignId)
  const locationReferencesQuery = useOrganizationLocationReferences(campaignId, organizationId)
  const edgesQuery = useCampaignOrganizationLocationConnectionEdges(campaignId, canManage)
  const mutations = useOrganizationLocationConnectionMutations(campaignId, organizationId)
  const [drawerState, setDrawerState] = React.useState<DrawerState | null>(null)

  const allLocations = locationsQuery.data ?? []
  const locations = React.useMemo(
    () => filterReferenceableCatalogRows(allLocations),
    [allLocations],
  )
  const locationsById = React.useMemo(() => buildLocationsById(allLocations), [allLocations])
  const edgesByLocationId = edgesQuery.data
  const occupancyLoaded = !canManage || !edgesQuery.isPending

  const locationConnections = React.useMemo(() => {
    if (!locationReferencesQuery.data) {
      return {
        previewItems: [],
        total: 0,
        emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
      }
    }

    return {
      ...buildOrganizationLocationConnectionCards(locationReferencesQuery.data, {
        campaignId,
        locationsById,
      }),
      emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
    }
  }, [campaignId, locationReferencesQuery.data, locationsById])

  const existingConnections = React.useMemo(
    () =>
      (locationReferencesQuery.data ?? []).map(({ connection }) => ({
        id: connection.id,
        locationId: connection.locationId,
        kind: connection.kind,
      })),
    [locationReferencesQuery.data],
  )

  const mutationContext = React.useMemo<OrganizationLocationConnectionMutationContext>(
    () => ({
      subjectOrganizationId: organizationId,
      locationCandidates: {
        items: locations,
        // GUARD: isAuthoritativeDomainSet means the ENTIRE domain, not "query succeeded".
        // Correct today because useLocations calls the full-list API.
        // REVISIT when locations become paginated — isSuccess alone will NOT suffice.
        isAuthoritativeDomainSet: locationsQuery.isSuccess,
      },
      connections: existingConnections,
      edgesByLocationId,
      occupancyLoaded,
    }),
    [
      edgesByLocationId,
      existingConnections,
      locations,
      locationsQuery.isSuccess,
      occupancyLoaded,
      organizationId,
    ],
  )

  const resolveDrawerAlternatives = React.useCallback(
    (connection: OrganizationLocationConnectionEditTarget) =>
      resolveRelationshipAlternatives({
        surface: 'organization_forward',
        canManage,
        occupancyLoaded,
        relationship: {
          connectionId: connection.connectionId,
          locationId: connection.locationId,
          kind: connection.kind,
          subjectOrganizationId: organizationId,
        },
        locationCandidates: {
          items: locations,
          isAuthoritativeDomainSet: locationsQuery.isSuccess,
        },
        connections: existingConnections,
        edgesByLocationId,
        copy: LOCATION_CONNECTION_KIND_OPTIONS_COPY,
      }).alternatives,
    [
      canManage,
      edgesByLocationId,
      existingConnections,
      locations,
      locationsQuery.isSuccess,
      occupancyLoaded,
      organizationId,
    ],
  )

  const visibleFamilies = React.useMemo(
    () => resolveVisibleOrganizationConnectionFamilies(locations),
    [locations],
  )

  const canAddToFamily = React.useMemo(() => {
    const result: Partial<Record<OrganizationLocationConnectionFamily, boolean>> = {}
    for (const family of visibleFamilies) {
      const intent = organizationConnectionDrawerIntentFromFamily(family)
      result[family] = organizationForwardFamilyHasAvailableTarget(
        intent,
        locations,
        organizationId,
        existingConnections,
        edgesByLocationId,
        undefined,
        occupancyLoaded,
      )
    }
    return result
  }, [
    edgesByLocationId,
    existingConnections,
    locations,
    occupancyLoaded,
    organizationId,
    visibleFamilies,
  ])

  const mutationError =
    mutations.error instanceof ApiError
      ? mutations.error.message
      : mutations.error
        ? ORGANIZATION_LOCATION_CONNECTION_MUTATION_ERROR
        : null

  const handleSubmit = React.useCallback(
    async (input: { locationId: string; kind: OrganizationLocationConnectionKind }) => {
      mutations.resetErrors()

      if (drawerState?.mode === 'changeKind' || drawerState?.mode === 'changeTarget') {
        await mutations.updateLocationConnection(
          drawerState.connection.connectionId,
          {
            locationId: input.locationId,
            kind: input.kind,
          },
          drawerState.connection.locationId,
        )
      } else {
        await mutations.addLocationConnection(input.locationId, input.kind)
      }

      setDrawerState(null)
    },
    [drawerState, mutations],
  )

  const handleRemoveConnection = React.useCallback(
    async ({ connectionId, locationId }: { connectionId: string; locationId: string }) => {
      mutations.resetErrors()
      await mutations.removeLocationConnection(connectionId, locationId)
    },
    [mutations],
  )

  const openAddDrawer = React.useCallback((intent: OrganizationConnectionDrawerIntent) => {
    setDrawerState({ mode: 'add', intent })
  }, [])

  const openAddFamily = React.useCallback((family: OrganizationLocationConnectionFamily) => {
    setDrawerState({ mode: 'add', intent: organizationConnectionDrawerIntentFromFamily(family) })
  }, [])

  const openChangeKindDrawer = React.useCallback(
    (connection: OrganizationLocationConnectionEditTarget) => {
      setDrawerState({
        mode: 'changeKind',
        intent: organizationDrawerIntentFromKind(connection.kind),
        connection,
      })
    },
    [],
  )

  const openChangeTargetDrawer = React.useCallback(
    (connection: OrganizationLocationConnectionEditTarget) => {
      setDrawerState({
        mode: 'changeTarget',
        intent: organizationDrawerIntentFromKind(connection.kind),
        connection,
      })
    },
    [],
  )

  const changeTargetCurrentEndpoint = React.useMemo(() => {
    if (drawerState?.mode !== 'changeTarget') {
      return undefined
    }

    return resolveOrganizationForwardCurrentLocationEndpoint({
      connectionId: drawerState.connection.connectionId,
      locationReferences: locationReferencesQuery.data ?? [],
      locationsById,
      campaignId,
    })
  }, [campaignId, drawerState, locationReferencesQuery.data, locationsById])

  return {
    canManage,
    organization,
    locations,
    locationsById,
    edgesByLocationId,
    occupancyLoaded,
    locationConnections,
    existingConnections,
    mutationContext,
    resolveDrawerAlternatives,
    visibleFamilies,
    canAddToFamily,
    locationReferencesQuery,
    edgesQuery,
    mutations,
    mutationError,
    drawerState,
    setDrawerState,
    openAddDrawer,
    openAddFamily,
    openChangeKindDrawer,
    openChangeTargetDrawer,
    changeTargetCurrentEndpoint,
    handleSubmit,
    handleRemoveConnection,
  }
}
