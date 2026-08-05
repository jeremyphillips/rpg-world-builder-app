'use client'

import * as React from 'react'

import type {
  CharacterLocationConnectionKind,
  Location,
  LocationConnectedPartyRow,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import {
  ApiError,
  canInverseWriteAnyLocationConnection,
  canInverseWriteLocationConnectionForOwner,
  resolveLocationConnectionEligibility,
} from '@rpg/contracts'
import { useQueryClient } from '@tanstack/react-query'

import { useCanManageCampaign, useCampaignCharacters } from '@/features/campaign'
import { useCampaignBuildContext, useNpcs } from '@/features/character'

import {
  createCharacterLocationConnection,
  deleteCharacterLocationConnection,
  updateCharacterLocationConnection,
} from '../api/character-location-connection-client'
import {
  createOrganizationLocationConnection,
  deleteOrganizationLocationConnection,
  updateOrganizationLocationConnection,
} from '../../organizations/api/organization-location-connection-client'
import { useOrganizations } from '../../organizations/hooks/use-organizations'
import { invalidateLocationConnectionQueries } from '../../lib/invalidate-location-connection-queries'
import {
  resolveLocationConnectedPartiesSectionEligibility,
  shouldShowLocationConnectedPartiesSection,
} from '../../lib/location-connected-parties-section-visibility'
import {
  organizationDrawerIntentFromKind,
  type OrganizationConnectionDrawerIntent,
  resolvePeopleSectionOrganizationAddAffordances,
  resolveTerritorialSectionOrganizationAddAffordances,
} from '../../lib/location-connection-drawer-intent'
import { toLocationConnectionEligibilityInput } from '../../lib/location-connection-eligibility-input'
import type { LocationConnectedPartyEditTarget } from '../components/location-connected-parties-section.client'
import { buildLocationPartyCharactersById } from '../lib/location-party-associations.lib'
import { useLocationConnectedParties } from './use-location-connected-parties'

export const LOCATION_CONNECTED_PARTIES_MUTATION_ERROR =
  'Could not update connected parties for this location.'

type OrganizationDrawerState =
  | {
      mode: 'add'
      intent: OrganizationConnectionDrawerIntent
      kind?: OrganizationLocationConnectionKind
    }
  | {
      mode: 'changeKind'
      intent: OrganizationConnectionDrawerIntent
      connection: {
        relationshipId: string
        organizationId: string
        kind: OrganizationLocationConnectionKind
      }
    }
  | {
      mode: 'replaceOrganization'
      intent: OrganizationConnectionDrawerIntent
      connection: {
        relationshipId: string
        organizationId: string
        kind: OrganizationLocationConnectionKind
      }
    }

type CharacterDrawerState =
  | { mode: 'add' }
  | {
      mode: 'edit'
      connection: {
        relationshipId: string
        characterId: string
        kind: CharacterLocationConnectionKind
      }
    }

async function upsertOrganizationInverseConnection(input: {
  campaignId: string
  locationId: string
  drawerState: OrganizationDrawerState
  organizationId: string
  kind: OrganizationLocationConnectionKind
}) {
  if (input.drawerState.mode === 'changeKind') {
    await updateOrganizationLocationConnection(
      input.campaignId,
      input.drawerState.connection.organizationId,
      input.drawerState.connection.relationshipId,
      { kind: input.kind },
    )
    return { organizationIds: [input.drawerState.connection.organizationId] }
  }

  if (input.drawerState.mode === 'replaceOrganization') {
    await deleteOrganizationLocationConnection(
      input.campaignId,
      input.drawerState.connection.organizationId,
      input.drawerState.connection.relationshipId,
    )
    await createOrganizationLocationConnection(input.campaignId, input.organizationId, {
      locationId: input.locationId,
      kind: input.kind,
    })
    return {
      organizationIds: [input.organizationId, input.drawerState.connection.organizationId],
    }
  }

  await createOrganizationLocationConnection(input.campaignId, input.organizationId, {
    locationId: input.locationId,
    kind: input.kind,
  })
  return { organizationIds: [input.organizationId] }
}

async function upsertCharacterInverseConnection(input: {
  campaignId: string
  locationId: string
  drawerState: CharacterDrawerState
  characterId: string
  kind: CharacterLocationConnectionKind
}) {
  if (input.drawerState.mode === 'edit') {
    const { relationshipId, characterId: previousCharacterId } = input.drawerState.connection

    if (previousCharacterId === input.characterId) {
      await updateCharacterLocationConnection(input.campaignId, input.characterId, relationshipId, {
        kind: input.kind,
      })
      return { characterIds: [input.characterId] }
    }

    await deleteCharacterLocationConnection(input.campaignId, previousCharacterId, relationshipId)
    await createCharacterLocationConnection(input.campaignId, input.characterId, {
      locationId: input.locationId,
      kind: input.kind,
    })
    return { characterIds: [input.characterId, previousCharacterId] }
  }

  await createCharacterLocationConnection(input.campaignId, input.characterId, {
    locationId: input.locationId,
    kind: input.kind,
  })
  return { characterIds: [input.characterId] }
}

export function useLocationConnectedPartiesDetail(campaignId: string, location: Location) {
  const locationId = location.id
  const canManage = useCanManageCampaign(campaignId)
  const canWriteInverse = canManage && canInverseWriteAnyLocationConnection()
  const queryClient = useQueryClient()
  const connectedPartiesQuery = useLocationConnectedParties(campaignId, locationId)
  const organizationsQuery = useOrganizations(campaignId)
  const campaignCharactersQuery = useCampaignCharacters(campaignId)
  const npcsQuery = useNpcs(campaignId)
  const { catalogIndex } = useCampaignBuildContext(campaignId)

  const [mutationError, setMutationError] = React.useState<string | null>(null)
  const [pendingRelationshipId, setPendingRelationshipId] = React.useState<string>()
  const [isMutationPending, setIsMutationPending] = React.useState(false)
  const [organizationDrawerState, setOrganizationDrawerState] =
    React.useState<OrganizationDrawerState | null>(null)
  const [characterDrawerState, setCharacterDrawerState] =
    React.useState<CharacterDrawerState | null>(null)

  const rows = connectedPartiesQuery.data?.items ?? []
  const sectionEligibility = React.useMemo(
    () => resolveLocationConnectedPartiesSectionEligibility(location),
    [location],
  )
  const characterOptions = React.useMemo(() => {
    const characters = buildLocationPartyCharactersById(
      campaignCharactersQuery.data ?? [],
      npcsQuery.data ?? [],
      catalogIndex,
    )
    return [...characters.values()]
  }, [campaignCharactersQuery.data, catalogIndex, npcsQuery.data])

  const eligibility = React.useMemo(
    () => resolveLocationConnectionEligibility(toLocationConnectionEligibilityInput(location)),
    [location],
  )

  const territorialOrganizationAddAffordances = React.useMemo(
    () => resolveTerritorialSectionOrganizationAddAffordances(location),
    [location],
  )

  const peopleOrganizationAddAffordances = React.useMemo(
    () => resolvePeopleSectionOrganizationAddAffordances(location),
    [location],
  )

  const invalidate = React.useCallback(
    async (input: { organizationId?: string; characterId?: string }) => {
      await invalidateLocationConnectionQueries(queryClient, {
        campaignId,
        organizationId: input.organizationId,
        characterId: input.characterId,
        locationIds: [locationId],
      })
    },
    [campaignId, locationId, queryClient],
  )

  const runMutation = React.useCallback(async (operation: () => Promise<void>) => {
    setMutationError(null)
    setIsMutationPending(true)
    try {
      await operation()
    } catch (error) {
      setMutationError(
        error instanceof ApiError ? error.message : LOCATION_CONNECTED_PARTIES_MUTATION_ERROR,
      )
    } finally {
      setIsMutationPending(false)
      setPendingRelationshipId(undefined)
    }
  }, [])

  const handleRemoveConnection = React.useCallback(
    async (input: {
      relationshipId: string
      subjectType: LocationConnectedPartyRow['subject']['type']
      subjectId: string
    }) => {
      if (!canWriteInverse) return

      setPendingRelationshipId(input.relationshipId)
      await runMutation(async () => {
        if (input.subjectType === 'character') {
          if (!canInverseWriteLocationConnectionForOwner('characters')) return
          await deleteCharacterLocationConnection(campaignId, input.subjectId, input.relationshipId)
          await invalidate({ characterId: input.subjectId })
          return
        }

        if (!canInverseWriteLocationConnectionForOwner('organizations')) return
        await deleteOrganizationLocationConnection(
          campaignId,
          input.subjectId,
          input.relationshipId,
        )
        await invalidate({ organizationId: input.subjectId })
      })
    },
    [campaignId, canWriteInverse, invalidate, runMutation],
  )

  const handleOrganizationSubmit = React.useCallback(
    async (input: { organizationId: string; kind: OrganizationLocationConnectionKind }) => {
      if (!canInverseWriteLocationConnectionForOwner('organizations') || !organizationDrawerState) {
        return
      }

      await runMutation(async () => {
        const result = await upsertOrganizationInverseConnection({
          campaignId,
          locationId,
          drawerState: organizationDrawerState,
          organizationId: input.organizationId,
          kind: input.kind,
        })
        for (const organizationId of result.organizationIds) {
          await invalidate({ organizationId })
        }
      })

      setOrganizationDrawerState(null)
    },
    [campaignId, invalidate, locationId, organizationDrawerState, runMutation],
  )

  const handleCharacterSubmit = React.useCallback(
    async (input: { characterId: string; kind: CharacterLocationConnectionKind }) => {
      if (!canInverseWriteLocationConnectionForOwner('characters') || !characterDrawerState) {
        return
      }

      await runMutation(async () => {
        const result = await upsertCharacterInverseConnection({
          campaignId,
          locationId,
          drawerState: characterDrawerState,
          characterId: input.characterId,
          kind: input.kind,
        })
        for (const characterId of result.characterIds) {
          await invalidate({ characterId })
        }
      })

      setCharacterDrawerState(null)
    },
    [campaignId, characterDrawerState, invalidate, locationId, runMutation],
  )

  const openOrganizationAddDrawer = React.useCallback(
    (intent: OrganizationConnectionDrawerIntent) => {
      setOrganizationDrawerState({ mode: 'add', intent })
    },
    [],
  )

  const openTerritorialAddDrawer = React.useCallback((kind: OrganizationLocationConnectionKind) => {
    setOrganizationDrawerState({ mode: 'add', intent: 'territorial_authority', kind })
  }, [])

  const handleChangeTerritorialKind = React.useCallback(
    (target: LocationConnectedPartyEditTarget) => {
      if (target.subjectType !== 'organization') return
      setOrganizationDrawerState({
        mode: 'changeKind',
        intent: organizationDrawerIntentFromKind(target.kind as OrganizationLocationConnectionKind),
        connection: {
          relationshipId: target.relationshipId,
          organizationId: target.subjectId,
          kind: target.kind as OrganizationLocationConnectionKind,
        },
      })
    },
    [],
  )

  const handleReplaceTerritorialOrganization = React.useCallback(
    (target: LocationConnectedPartyEditTarget) => {
      if (target.subjectType !== 'organization') return
      setOrganizationDrawerState({
        mode: 'replaceOrganization',
        intent: organizationDrawerIntentFromKind(target.kind as OrganizationLocationConnectionKind),
        connection: {
          relationshipId: target.relationshipId,
          organizationId: target.subjectId,
          kind: target.kind as OrganizationLocationConnectionKind,
        },
      })
    },
    [],
  )

  const handleEditConnection = React.useCallback((target: LocationConnectedPartyEditTarget) => {
    if (target.subjectType === 'organization') {
      setOrganizationDrawerState({
        mode: 'changeKind',
        intent: organizationDrawerIntentFromKind(target.kind as OrganizationLocationConnectionKind),
        connection: {
          relationshipId: target.relationshipId,
          organizationId: target.subjectId,
          kind: target.kind as OrganizationLocationConnectionKind,
        },
      })
      return
    }

    setCharacterDrawerState({
      mode: 'edit',
      connection: {
        relationshipId: target.relationshipId,
        characterId: target.subjectId,
        kind: target.kind as CharacterLocationConnectionKind,
      },
    })
  }, [])

  const canEditRow = React.useCallback(
    (row: LocationConnectedPartyRow) =>
      row.subject.type === 'character'
        ? canInverseWriteLocationConnectionForOwner('characters')
        : canInverseWriteLocationConnectionForOwner('organizations'),
    [],
  )

  return {
    connectedPartiesQuery,
    organizations: organizationsQuery.data ?? [],
    characterOptions,
    rows,
    canManage,
    canWriteInverse,
    mutationError,
    isMutationPending,
    pendingRelationshipId,
    organizationDrawerState,
    setOrganizationDrawerState,
    characterDrawerState,
    setCharacterDrawerState,
    openOrganizationAddDrawer,
    openTerritorialAddDrawer,
    handleRemoveConnection,
    handleOrganizationSubmit,
    handleCharacterSubmit,
    handleEditConnection,
    handleChangeTerritorialKind,
    handleReplaceTerritorialOrganization,
    canEditRow,
    showTerritorialSection: shouldShowLocationConnectedPartiesSection({
      section: 'territorialAuthority',
      eligibility: sectionEligibility,
      canManage,
      rows,
      sectionGroup: 'territorial_authority',
    }),
    showPeopleSection: shouldShowLocationConnectedPartiesSection({
      section: 'peopleAndOrganizations',
      eligibility: sectionEligibility,
      canManage,
      rows,
      sectionGroup: 'people_and_organizations',
    }),
    territorialOrganizationAddAffordances,
    peopleOrganizationAddAffordances,
    canAddCharacter:
      canWriteInverse &&
      canInverseWriteLocationConnectionForOwner('characters') &&
      eligibility.characterKinds.length > 0,
    canAddOrganizationInverse:
      canWriteInverse && canInverseWriteLocationConnectionForOwner('organizations'),
  }
}
