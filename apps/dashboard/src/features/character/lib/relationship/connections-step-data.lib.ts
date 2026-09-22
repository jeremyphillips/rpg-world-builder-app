import type {
  CampaignCharacterListItem,
  CampaignNpcListItem,
  CharacterBuildContext,
  Location,
} from '@rpg/contracts'
import { indexCharacterBuildCatalog, resolvePlayableBuilderContent } from '@rpg/contracts'

import { buildLocationConnectedPartyCharactersById } from '@/features/content/locations/lib/connected-parties/location-connected-party-character-options.lib'

import { filterResidenceEligibleLocations } from '../connections/residence-location-connection.lib'
import { filterPropertyEligibleLocations } from '../connections/property-location-connection.lib'
import { resolveCharacterLocationsQueryStatus } from './character-locations-query-status.lib'

export function buildConnectionsStepData(input: {
  buildContext: CharacterBuildContext
  campaignCharacters: readonly CampaignCharacterListItem[]
  campaignNpcs: readonly CampaignNpcListItem[]
  locations: readonly Location[] | undefined
  locationsPending: boolean
  locationsError: Error | null
  locationsHasData: boolean
}) {
  const campaignId =
    input.buildContext.rulesScope.type === 'campaign'
      ? input.buildContext.rulesScope.campaignId
      : undefined
  const availableOrganizations = resolvePlayableBuilderContent(input.buildContext).organizations
  const organizationsById = new Map(
    input.buildContext.catalog.organizations.map((organization) => [organization.id, organization]),
  )
  const allLocations = input.locations ?? []
  const eligibleResidenceLocations = filterResidenceEligibleLocations(allLocations)
  const eligiblePropertyLocations = filterPropertyEligibleLocations(allLocations)
  const locationsById = new Map(allLocations.map((location) => [location.id, location]))
  const catalogIndex = indexCharacterBuildCatalog(input.buildContext.catalog)
  const charactersById = buildLocationConnectedPartyCharactersById(
    input.campaignCharacters,
    input.campaignNpcs,
    catalogIndex,
  )
  const locationsQueryStatus = resolveCharacterLocationsQueryStatus({
    campaignId,
    isPending: input.locationsPending,
    isError: input.locationsError !== null,
    error: input.locationsError,
    hasData: input.locationsHasData,
  })

  return {
    campaignId,
    availableOrganizations,
    organizationsById,
    locationsById,
    charactersById,
    eligibleResidenceLocations,
    eligiblePropertyLocations,
    allLocations,
    locationsQueryStatus,
    campaignCharacterOptions: [...charactersById.values()],
  }
}
