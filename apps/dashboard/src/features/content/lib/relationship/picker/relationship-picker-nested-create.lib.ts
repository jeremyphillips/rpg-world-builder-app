import type {
  CharacterBuildCatalogIndex,
  CharacterLocationConnectionKind,
  Location,
  LocationConnectedPartyRow,
  Organization,
  OrganizationLocationConnectionEdgeAtLocation,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import type { QueryClient } from '@tanstack/react-query'

import type { CreatedContentResult } from '@/lib/create-flow'
import {
  buildCharacterCardViewModel,
  fetchCampaignNpcs,
  invalidateCampaignNpcQueries,
} from '@/features/character'

import { filterReferenceableCatalogRows } from '../../form-options/content-reference-catalog.lib'
import { invalidateLocationConnectionQueries } from '../location-connection/invalidate-location-connection-queries'
import {
  characterInverseSubjectHasAvailableKind,
  locationEligibleForOrganizationKind,
  organizationInverseSubjectHasAvailableKind,
  resolveEdgesAtLocation,
} from '../location-connection/location-connection-drawer-intent'
import { organizationLocationConnectionHasAvailableKind } from '../location-connection/location-connection-duplicate-keys'
import type { LocationConnectedPartyCharacterOption } from '../../../locations/lib/connected-parties/location-connected-party-character-options.lib'
import { listLocations } from '../../../locations/api/locations-api'
import { getLocationConnectedParties } from '../../../locations/api/location-connected-parties-client'
import { locationConnectedPartiesQueryKey } from '../../../locations/hooks/use-location-connected-parties'
import { locationsQueryKey } from '../../../locations/hooks/use-locations'
import { getCampaignOrganizationLocationConnectionEdges } from '../../../organizations/api/organization-location-connection-edges-client'
import { getOrganizationLocationReferences } from '../../../organizations/api/organization-location-reference-client'
import { listOrganizations } from '../../../organizations/api/organizations-api'
import { campaignOrganizationLocationConnectionEdgesQueryKey } from '../../../organizations/hooks/use-campaign-organization-location-connection-edges'
import { organizationLocationReferencesQueryKey } from '../../../organizations/hooks/use-organization-location-references'
import { organizationsQueryKey } from '../../../organizations/hooks/use-organizations'
import {
  resolveRelationshipPickerCreateIntents,
  type RelationshipPickerCreateIntent,
} from './relationship-picker-create-intents.lib'
import type { NestedCreateHandoffResult } from './relationship-picker-nested-create.types'

export function resolveRelationshipPickerCharacterCreateIntents(input: {
  createableCharacterTypes: readonly ['npc']
}): RelationshipPickerCreateIntent[] {
  return resolveRelationshipPickerCreateIntents({
    target: 'character',
    createableCharacterTypes: input.createableCharacterTypes,
  })
}

/** Sentinel subject id — only occupancy / duplicate checks that ignore subject history apply. */
export const RELATIONSHIP_PICKER_NESTED_CREATE_ORGANIZATION_SENTINEL_ID =
  '__relationship_picker_nested_create__' as const

export function relationshipPickerOrganizationCreateAvailable(input: {
  locationId: string
  kinds: readonly OrganizationLocationConnectionKind[]
  orgRows: readonly LocationConnectedPartyRow[]
}): boolean {
  if (input.kinds.length === 0) {
    return false
  }

  return organizationInverseSubjectHasAvailableKind(
    RELATIONSHIP_PICKER_NESTED_CREATE_ORGANIZATION_SENTINEL_ID,
    input.locationId,
    input.kinds,
    input.orgRows,
  )
}

export function resolveRelationshipPickerOrganizationCreateIntents(input: {
  locationId: string
  kinds: readonly OrganizationLocationConnectionKind[]
  orgRows: readonly LocationConnectedPartyRow[]
}): RelationshipPickerCreateIntent[] {
  if (!relationshipPickerOrganizationCreateAvailable(input)) {
    return []
  }

  return resolveRelationshipPickerCreateIntents({ target: 'organization' })
}

export function revalidateCreatedLocationForOrganizationForwardDrawer(input: {
  location: Location | undefined
  kind: OrganizationLocationConnectionKind
  subjectOrganizationId: string
  existingConnections: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>
  edgesByLocationId?: Readonly<
    Record<string, readonly OrganizationLocationConnectionEdgeAtLocation[]>
  >
  excludeConnectionId?: string
}): boolean {
  if (!input.location) {
    return false
  }

  if (
    !locationEligibleForOrganizationKind(
      input.location,
      input.kind,
      input.subjectOrganizationId,
      input.existingConnections,
      input.edgesByLocationId,
      input.excludeConnectionId,
    )
  ) {
    return false
  }

  const edgesAtLocation = resolveEdgesAtLocation(input.location.id, input.edgesByLocationId)

  return organizationLocationConnectionHasAvailableKind({
    locationId: input.location.id,
    kinds: [input.kind],
    subjectOrganizationId: input.subjectOrganizationId,
    connections: input.existingConnections,
    edgesAtLocation,
    excludeConnectionId: input.excludeConnectionId,
  })
}

export function revalidateCreatedOrganizationForInverseDrawer(input: {
  organization: Organization | undefined
  locationId: string
  kinds: readonly OrganizationLocationConnectionKind[]
  orgRows: readonly LocationConnectedPartyRow[]
  excludeRelationshipId?: string
}): boolean {
  if (!input.organization) {
    return false
  }

  return organizationInverseSubjectHasAvailableKind(
    input.organization.id,
    input.locationId,
    input.kinds,
    input.orgRows,
    input.excludeRelationshipId,
  )
}

export function revalidateCreatedNpcForInverseDrawer(input: {
  character: LocationConnectedPartyCharacterOption | undefined
  kinds: readonly CharacterLocationConnectionKind[]
  existingKeys: ReadonlySet<string>
}): boolean {
  if (!input.character) {
    return false
  }

  return characterInverseSubjectHasAvailableKind(
    input.character.id,
    input.kinds,
    input.existingKeys,
  )
}

export async function invalidateRelationshipPickerNestedCreateQueries(
  queryClient: QueryClient,
  input: {
    campaignId: string
    result: CreatedContentResult
    subjectOrganizationId?: string
    locationId?: string
  },
): Promise<void> {
  const invalidations: Promise<void>[] = []

  if (input.result.contentType === 'organizations') {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: organizationsQueryKey(input.campaignId) }),
    )
  }

  if (input.result.contentType === 'npcs') {
    invalidations.push(invalidateCampaignNpcQueries(queryClient, input.campaignId))
  }

  invalidations.push(
    invalidateLocationConnectionQueries(queryClient, {
      campaignId: input.campaignId,
      organizationId: input.subjectOrganizationId,
      locationIds: input.locationId ? [input.locationId] : undefined,
    }),
  )

  await Promise.all(invalidations)
}

export async function fetchReferenceableOrganizations(
  queryClient: QueryClient,
  campaignId: string,
): Promise<Organization[]> {
  const result = await queryClient.fetchQuery({
    queryKey: organizationsQueryKey(campaignId),
    queryFn: () => listOrganizations(campaignId),
  })
  return filterReferenceableCatalogRows(result.items)
}

export async function fetchReferenceableLocations(
  queryClient: QueryClient,
  campaignId: string,
): Promise<Location[]> {
  const result = await queryClient.fetchQuery({
    queryKey: locationsQueryKey(campaignId),
    queryFn: () => listLocations(campaignId),
  })
  return filterReferenceableCatalogRows(result.items)
}

function mapNpcListItemToCharacterOption(
  npc: Awaited<ReturnType<typeof fetchCampaignNpcs>>[number],
  catalogIndex: CharacterBuildCatalogIndex | null | undefined,
): LocationConnectedPartyCharacterOption {
  return {
    id: npc.character.id,
    name: npc.character.name,
    summary: catalogIndex ? buildCharacterCardViewModel(npc.character, catalogIndex).summary : '',
    characterType: 'npc',
    classIds: npc.character.classes.map((entry) => entry.classId),
    speciesId: npc.character.species.id,
  }
}

export async function fetchReferenceableNpcCharacterOptions(
  queryClient: QueryClient,
  input: { campaignId: string; catalogIndex?: CharacterBuildCatalogIndex | null },
): Promise<LocationConnectedPartyCharacterOption[]> {
  const npcs = await fetchCampaignNpcs(queryClient, input.campaignId)

  return npcs.map((npc) => mapNpcListItemToCharacterOption(npc, input.catalogIndex))
}

export type OrganizationForwardNestedCreateRevalidationContext = {
  existingConnections: ReadonlyArray<{
    id: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>
  edgesByLocationId: Readonly<
    Record<string, readonly OrganizationLocationConnectionEdgeAtLocation[]>
  >
}

export async function fetchOrganizationForwardNestedCreateRevalidationContext(
  queryClient: QueryClient,
  input: { campaignId: string; organizationId: string },
): Promise<OrganizationForwardNestedCreateRevalidationContext> {
  const [references, edgesByLocationId] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: organizationLocationReferencesQueryKey(input.campaignId, input.organizationId),
      queryFn: () => getOrganizationLocationReferences(input.campaignId, input.organizationId),
    }),
    queryClient.fetchQuery({
      queryKey: campaignOrganizationLocationConnectionEdgesQueryKey(input.campaignId),
      queryFn: () => getCampaignOrganizationLocationConnectionEdges(input.campaignId),
    }),
  ])

  return {
    existingConnections: references.map(({ connection }) => ({
      id: connection.id,
      locationId: connection.locationId,
      kind: connection.kind,
    })),
    edgesByLocationId,
  }
}

export async function fetchInverseOrganizationNestedCreateRevalidationRows(
  queryClient: QueryClient,
  input: { campaignId: string; locationId: string },
): Promise<readonly LocationConnectedPartyRow[]> {
  const response = await queryClient.fetchQuery({
    queryKey: locationConnectedPartiesQueryKey(input.campaignId, input.locationId),
    queryFn: () => getLocationConnectedParties(input.campaignId, input.locationId),
  })

  return response.items.filter((row) => row.subjectType === 'organization')
}

export type RelationshipPickerNestedCreateHandoffInput = {
  campaignId: string
  result: CreatedContentResult
  subjectOrganizationId?: string
  locationId?: string
  catalogIndex?: CharacterBuildCatalogIndex | null
  revalidateCreatedOrganization?: (
    organization: Organization,
    orgRows: readonly LocationConnectedPartyRow[],
  ) => boolean
  revalidateCreatedLocation?: (
    location: Location,
    context: OrganizationForwardNestedCreateRevalidationContext,
  ) => boolean
  revalidateCreatedNpc?: (character: LocationConnectedPartyCharacterOption) => boolean
}

export async function resolveRelationshipPickerNestedCreateHandoff(
  queryClient: QueryClient,
  input: RelationshipPickerNestedCreateHandoffInput,
): Promise<NestedCreateHandoffResult> {
  await invalidateRelationshipPickerNestedCreateQueries(queryClient, {
    campaignId: input.campaignId,
    result: input.result,
    subjectOrganizationId: input.subjectOrganizationId,
    locationId: input.locationId,
  })

  if (input.result.contentType === 'organizations') {
    return resolveOrganizationNestedCreateHandoff(queryClient, input)
  }

  if (input.result.contentType === 'npcs') {
    return resolveNpcNestedCreateHandoff(queryClient, input)
  }

  if (input.result.contentType === 'locations') {
    return resolveLocationNestedCreateHandoff(queryClient, input)
  }

  return { status: 'unsupported' }
}

async function resolveOrganizationNestedCreateHandoff(
  queryClient: QueryClient,
  input: RelationshipPickerNestedCreateHandoffInput,
): Promise<NestedCreateHandoffResult> {
  const organizations = await fetchReferenceableOrganizations(queryClient, input.campaignId)
  const organization = organizations.find((entry) => entry.id === input.result.id)
  if (!organization) {
    return { status: 'not-found' }
  }

  const orgRows =
    input.locationId != null
      ? await fetchInverseOrganizationNestedCreateRevalidationRows(queryClient, {
          campaignId: input.campaignId,
          locationId: input.locationId,
        })
      : []

  if (
    input.revalidateCreatedOrganization &&
    !input.revalidateCreatedOrganization(organization, orgRows)
  ) {
    return { status: 'ineligible' }
  }

  return { status: 'selected', organizationId: organization.id }
}

async function resolveLocationNestedCreateHandoff(
  queryClient: QueryClient,
  input: RelationshipPickerNestedCreateHandoffInput,
): Promise<NestedCreateHandoffResult> {
  const locations = await fetchReferenceableLocations(queryClient, input.campaignId)
  const location = locations.find((entry) => entry.id === input.result.id)
  if (!location) {
    return { status: 'not-found' }
  }

  const forwardContext =
    input.subjectOrganizationId != null
      ? await fetchOrganizationForwardNestedCreateRevalidationContext(queryClient, {
          campaignId: input.campaignId,
          organizationId: input.subjectOrganizationId,
        })
      : {
          existingConnections: [],
          edgesByLocationId: {},
        }

  if (
    input.revalidateCreatedLocation &&
    !input.revalidateCreatedLocation(location, forwardContext)
  ) {
    return { status: 'ineligible' }
  }

  return { status: 'selected', locationId: location.id }
}

async function resolveNpcNestedCreateHandoff(
  queryClient: QueryClient,
  input: RelationshipPickerNestedCreateHandoffInput,
): Promise<NestedCreateHandoffResult> {
  const characters = await fetchReferenceableNpcCharacterOptions(queryClient, {
    campaignId: input.campaignId,
    catalogIndex: input.catalogIndex,
  })
  const character = characters.find((entry) => entry.id === input.result.id)
  if (!character) {
    return { status: 'not-found' }
  }

  if (input.revalidateCreatedNpc && !input.revalidateCreatedNpc(character)) {
    return { status: 'ineligible' }
  }

  return { status: 'selected', characterId: character.id }
}
