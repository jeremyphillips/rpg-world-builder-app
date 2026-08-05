'use client'

import * as React from 'react'

import type { OrganizationLocationConnectionKind } from '@rpg/contracts'
import { ApiError } from '@rpg/contracts'

import { useCanManageCampaign } from '@/features/campaign'

import { useLocations } from '../../locations/hooks/use-locations'
import {
  locationEligibleForOrganizationDrawerIntent,
  organizationDrawerIntentFromKind,
  resolveOrganizationKindsForDrawerIntent,
  type OrganizationConnectionDrawerIntent,
} from '../../lib/location-connection-drawer-intent'
import { useOrganizationLocationConnectionMutations } from './use-organization-location-connection-mutations'
import { useOrganizationLocationReferences } from './use-organization-location-references'
import { buildOrganizationLocationConnectionCards } from '../lib/build-organization-location-connection-cards'
import { ORGANIZATION_EMPTY_SECTION_TEXT } from '../lib/organization-display'
import type { OrganizationLocationConnectionEditTarget } from '../components/organization-location-connections-section.client'
import { ORGANIZATION_LOCATION_CONNECTION_MUTATION_ERROR } from '../components/organization-location-connections-section.client'

type DrawerState =
  | {
      mode: 'add'
      intent: OrganizationConnectionDrawerIntent
      kind?: OrganizationLocationConnectionKind
    }
  | {
      mode: 'edit'
      intent: OrganizationConnectionDrawerIntent
      connection: OrganizationLocationConnectionEditTarget
    }

export function useOrganizationLocationConnectionsDetail(
  campaignId: string,
  organizationId: string,
) {
  const canManage = useCanManageCampaign(campaignId)
  const locationsQuery = useLocations(campaignId)
  const locationReferencesQuery = useOrganizationLocationReferences(campaignId, organizationId)
  const mutations = useOrganizationLocationConnectionMutations(campaignId, organizationId)
  const [drawerState, setDrawerState] = React.useState<DrawerState | null>(null)

  const locationConnections = React.useMemo(() => {
    if (!locationReferencesQuery.data) {
      return {
        previewItems: [],
        total: 0,
        emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
      }
    }

    return {
      ...buildOrganizationLocationConnectionCards(locationReferencesQuery.data, { campaignId }),
      emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
    }
  }, [campaignId, locationReferencesQuery.data])

  const existingConnections = React.useMemo(
    () =>
      (locationReferencesQuery.data ?? []).map(({ connection }) => ({
        id: connection.id,
        locationId: connection.locationId,
        kind: connection.kind,
      })),
    [locationReferencesQuery.data],
  )

  const availableAddIntents = React.useMemo(() => {
    const intents: OrganizationConnectionDrawerIntent[] = []
    for (const intent of ['site', 'geographic_presence', 'territorial_authority'] as const) {
      if (
        (locationsQuery.data ?? []).some((location) =>
          locationEligibleForOrganizationDrawerIntent(location, intent),
        )
      ) {
        intents.push(intent)
      }
    }
    return intents
  }, [locationsQuery.data])

  const emptyKindSlots = React.useMemo(() => {
    if (!canManage) return []

    const kinds = new Set<OrganizationLocationConnectionKind>()
    for (const location of locationsQuery.data ?? []) {
      for (const intent of availableAddIntents) {
        for (const kind of resolveOrganizationKindsForDrawerIntent(location, intent)) {
          kinds.add(kind)
        }
      }
    }
    return [...kinds]
  }, [availableAddIntents, canManage, locationsQuery.data])

  const mutationError =
    mutations.error instanceof ApiError
      ? mutations.error.message
      : mutations.error
        ? ORGANIZATION_LOCATION_CONNECTION_MUTATION_ERROR
        : null

  const handleSubmit = React.useCallback(
    async (input: { locationId: string; kind: OrganizationLocationConnectionKind }) => {
      mutations.resetErrors()

      if (drawerState?.mode === 'edit') {
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

  const openAddKind = React.useCallback((kind: OrganizationLocationConnectionKind) => {
    setDrawerState({
      mode: 'add',
      intent: organizationDrawerIntentFromKind(kind),
      kind,
    })
  }, [])

  const openEditDrawer = React.useCallback(
    (connection: OrganizationLocationConnectionEditTarget) => {
      setDrawerState({
        mode: 'edit',
        intent: organizationDrawerIntentFromKind(connection.kind),
        connection,
      })
    },
    [],
  )

  return {
    canManage,
    locations: locationsQuery.data ?? [],
    locationConnections,
    existingConnections,
    availableAddIntents,
    emptyKindSlots,
    locationReferencesQuery,
    mutations,
    mutationError,
    drawerState,
    setDrawerState,
    openAddDrawer,
    openAddKind,
    openEditDrawer,
    handleSubmit,
    handleRemoveConnection,
  }
}
