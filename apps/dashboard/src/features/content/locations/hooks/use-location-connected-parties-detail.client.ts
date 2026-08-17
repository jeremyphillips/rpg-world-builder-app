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

import { filterReferenceableCatalogRows } from '../../lib/form-options/content-reference-catalog.lib'
import { buildLocationsById } from '../lib/location-display'
import { useLocations } from './use-locations'
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
import { peopleSectionHasAvailableTarget } from '../../lib/location-connection-kind-options'
import type { LocationConnectedPartyEditTarget } from '../components/location-connected-parties-section.client'
import { buildPeopleKindSlots } from '../components/location-connected-parties-section.client'
import { buildLocationConnectedPartyCharactersById } from '../lib/location-connected-party-character-options.lib'
import { resolveLocationInverseCurrentOrganizationEndpoint } from '../../lib/relationship/resolve-relationship-drawer-current-endpoint'
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
  | { mode: 'add'; kind?: CharacterLocationConnectionKind }
  | {
      mode: 'changeKind'
      connection: {
        relationshipId: string
        characterId: string
        kind: CharacterLocationConnectionKind
      }
    }

type PeopleDrawerState = {
  mode: 'add'
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
  if (input.drawerState.mode === 'changeKind') {
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
  const locationsQuery = useLocations(campaignId)
  const locationsById = React.useMemo(
    () => buildLocationsById(locationsQuery.data ?? []),
    [locationsQuery.data],
  )
  const organizationsQuery = useOrganizations(campaignId)
  const allOrganizations = organizationsQuery.data ?? []
  const referenceableOrganizations = React.useMemo(
    () => filterReferenceableCatalogRows(allOrganizations),
    [allOrganizations],
  )
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
  const [peopleDrawerState, setPeopleDrawerState] = React.useState<PeopleDrawerState | null>(null)

  const rows = connectedPartiesQuery.data?.items ?? []
  const sectionEligibility = React.useMemo(
    () => resolveLocationConnectedPartiesSectionEligibility(location),
    [location],
  )
  const characterOptions = React.useMemo(() => {
    const characters = buildLocationConnectedPartyCharactersById(
      campaignCharactersQuery.data ?? [],
      npcsQuery.data ?? [],
      catalogIndex,
    )
    return [...characters.values()]
  }, [campaignCharactersQuery.data, catalogIndex, npcsQuery.data])

  const characterOptionsById = React.useMemo(
    () => new Map(characterOptions.map((option) => [option.id, option])),
    [characterOptions],
  )

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

  const peopleKindSlots = React.useMemo(
    () =>
      buildPeopleKindSlots({
        organizationKinds: eligibility.organizationKinds,
        characterKinds: eligibility.characterKinds,
      }),
    [eligibility.characterKinds, eligibility.organizationKinds],
  )

  const organizationIds = React.useMemo(
    () => referenceableOrganizations.map((organization) => organization.id),
    [referenceableOrganizations],
  )

  const characterIds = React.useMemo(
    () => characterOptions.map((character) => character.id),
    [characterOptions],
  )

  const canAddToPeopleSection = React.useMemo(
    () =>
      canWriteInverse &&
      peopleSectionHasAvailableTarget({
        kindSlots: peopleKindSlots,
        locationId,
        rows,
        organizationIds,
        characterIds,
        canAddOrganization: canInverseWriteLocationConnectionForOwner('organizations'),
        canAddCharacter:
          canInverseWriteLocationConnectionForOwner('characters') &&
          eligibility.characterKinds.length > 0,
      }),
    [
      canWriteInverse,
      characterIds,
      eligibility.characterKinds.length,
      locationId,
      organizationIds,
      peopleKindSlots,
      rows,
    ],
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

  const handlePeopleDrawerOrganizationSubmit = React.useCallback(
    async (input: { organizationId: string; kind: OrganizationLocationConnectionKind }) => {
      if (!canInverseWriteLocationConnectionForOwner('organizations') || !peopleDrawerState) {
        return
      }

      await runMutation(async () => {
        const result = await upsertOrganizationInverseConnection({
          campaignId,
          locationId,
          drawerState: {
            mode: 'add',
            intent: organizationDrawerIntentFromKind(input.kind),
            kind: input.kind,
          },
          organizationId: input.organizationId,
          kind: input.kind,
        })
        for (const organizationId of result.organizationIds) {
          await invalidate({ organizationId })
        }
      })

      setPeopleDrawerState(null)
    },
    [campaignId, invalidate, locationId, peopleDrawerState, runMutation],
  )

  const handlePeopleDrawerCharacterSubmit = React.useCallback(
    async (input: { characterId: string; kind: CharacterLocationConnectionKind }) => {
      if (!canInverseWriteLocationConnectionForOwner('characters') || !peopleDrawerState) {
        return
      }

      await runMutation(async () => {
        const result = await upsertCharacterInverseConnection({
          campaignId,
          locationId,
          drawerState: { mode: 'add', kind: input.kind },
          characterId: input.characterId,
          kind: input.kind,
        })
        for (const characterId of result.characterIds) {
          await invalidate({ characterId })
        }
      })

      setPeopleDrawerState(null)
    },
    [campaignId, invalidate, locationId, peopleDrawerState, runMutation],
  )

  const openOrganizationAddDrawer = React.useCallback(
    (intent: OrganizationConnectionDrawerIntent) => {
      setOrganizationDrawerState({ mode: 'add', intent })
    },
    [],
  )

  const openOrganizationAddKind = React.useCallback((kind: OrganizationLocationConnectionKind) => {
    setOrganizationDrawerState({
      mode: 'add',
      intent: organizationDrawerIntentFromKind(kind),
      kind,
    })
  }, [])

  const openTerritorialAddDrawer = React.useCallback((kind: OrganizationLocationConnectionKind) => {
    setOrganizationDrawerState({ mode: 'add', intent: 'territorial_authority', kind })
  }, [])

  const openCharacterAddKind = React.useCallback((kind: CharacterLocationConnectionKind) => {
    setCharacterDrawerState({ mode: 'add', kind })
  }, [])

  const openPeopleSectionAdd = React.useCallback(() => {
    setPeopleDrawerState({ mode: 'add' })
  }, [])

  const handleChangeTerritorialKind = React.useCallback(
    (target: LocationConnectedPartyEditTarget) => {
      if (target.subjectType !== 'organization') return
      setOrganizationDrawerState({
        mode: 'changeKind',
        intent: organizationDrawerIntentFromKind(target.kind),
        connection: {
          relationshipId: target.relationshipId,
          organizationId: target.subjectId,
          kind: target.kind,
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
        intent: organizationDrawerIntentFromKind(target.kind),
        connection: {
          relationshipId: target.relationshipId,
          organizationId: target.subjectId,
          kind: target.kind,
        },
      })
    },
    [],
  )

  const handleEditConnection = React.useCallback((target: LocationConnectedPartyEditTarget) => {
    if (target.subjectType === 'organization') {
      setOrganizationDrawerState({
        mode: 'changeKind',
        intent: organizationDrawerIntentFromKind(target.kind),
        connection: {
          relationshipId: target.relationshipId,
          organizationId: target.subjectId,
          kind: target.kind,
        },
      })
      return
    }

    setCharacterDrawerState({
      mode: 'changeKind',
      connection: {
        relationshipId: target.relationshipId,
        characterId: target.subjectId,
        kind: target.kind,
      },
    })
  }, [])

  const canEditRow = React.useCallback(
    (row: LocationConnectedPartyRow) =>
      row.subjectType === 'character'
        ? canInverseWriteLocationConnectionForOwner('characters')
        : canInverseWriteLocationConnectionForOwner('organizations'),
    [],
  )

  const replaceOrganizationCurrentEndpoint = React.useMemo(() => {
    if (organizationDrawerState?.mode !== 'replaceOrganization') {
      return undefined
    }

    return resolveLocationInverseCurrentOrganizationEndpoint({
      relationshipId: organizationDrawerState.connection.relationshipId,
      rows,
      organizations: allOrganizations,
    })
  }, [allOrganizations, organizationDrawerState, rows])

  return {
    connectedPartiesQuery,
    organizations: referenceableOrganizations,
    organizationCandidates: {
      items: referenceableOrganizations.map((organization) => ({
        id: organization.id,
        name: organization.name,
      })),
      // GUARD: isAuthoritativeDomainSet means the ENTIRE domain, not "query succeeded".
      // Correct today because useOrganizations calls the full-list API.
      // REVISIT when organizations become paginated — isSuccess alone will NOT suffice.
      isAuthoritativeDomainSet: organizationsQuery.isSuccess,
    },
    characterOptions,
    characterOptionsById,
    rows,
    campaignId,
    locationsById,
    canManage,
    canWriteInverse,
    mutationError,
    isMutationPending,
    pendingRelationshipId,
    organizationDrawerState,
    setOrganizationDrawerState,
    characterDrawerState,
    setCharacterDrawerState,
    peopleDrawerState,
    setPeopleDrawerState,
    openOrganizationAddDrawer,
    openOrganizationAddKind,
    openTerritorialAddDrawer,
    openCharacterAddKind,
    openPeopleSectionAdd,
    handleRemoveConnection,
    handleOrganizationSubmit,
    handleCharacterSubmit,
    handlePeopleDrawerOrganizationSubmit,
    handlePeopleDrawerCharacterSubmit,
    handleEditConnection,
    handleChangeTerritorialKind,
    handleReplaceTerritorialOrganization,
    replaceOrganizationCurrentEndpoint,
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
    peopleKindSlots,
    canAddToPeopleSection,
    canAddCharacter:
      canWriteInverse &&
      canInverseWriteLocationConnectionForOwner('characters') &&
      eligibility.characterKinds.length > 0,
    canAddOrganizationInverse:
      canWriteInverse && canInverseWriteLocationConnectionForOwner('organizations'),
  }
}
