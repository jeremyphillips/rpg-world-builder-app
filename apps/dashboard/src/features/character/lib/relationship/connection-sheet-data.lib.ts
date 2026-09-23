import type {
  CampaignCharacterListItem,
  CampaignNpcListItem,
  Location,
  Organization,
} from '@rpg/contracts'
import { isContentPlayableFor } from '@rpg/contracts'

import { buildLocationConnectedPartyCharactersById } from '@/features/content'

import { filterResidenceEligibleLocations } from '../connections/residence-location-connection.lib'
import { filterPropertyEligibleLocations } from '../connections/property-location-connection.lib'
import { resolveCharacterLocationsQueryStatus } from './character-locations-query-status.lib'
import { resolveRelationshipPlayActor } from './character-relationship-play-actor.lib'
import type { CharacterRelationshipSubjectKind } from '../invalidate-character-relationship-queries'

export function buildConnectionSheetData(input: {
  campaignId: string
  characterId: string
  subjectKind: CharacterRelationshipSubjectKind
  canEdit: boolean
  organizations: readonly Organization[]
  locations: readonly Location[] | undefined
  locationsPending: boolean
  locationsError: Error | null
  locationsHasData: boolean
  campaignCharacters: readonly CampaignCharacterListItem[]
  campaignNpcs: readonly CampaignNpcListItem[]
}) {
  const playActor = resolveRelationshipPlayActor(input.subjectKind, input.characterId)
  const availableOrganizations = input.organizations.filter((organization) =>
    isContentPlayableFor(organization, playActor),
  )
  const organizationsById = new Map(
    input.organizations.map((organization) => [organization.id, organization]),
  )
  const allLocations = input.locations ?? []
  const eligibleResidenceLocations = filterResidenceEligibleLocations(allLocations)
  const eligiblePropertyLocations = filterPropertyEligibleLocations(allLocations)
  const locationsById = new Map(allLocations.map((location) => [location.id, location]))
  const charactersById = buildLocationConnectedPartyCharactersById(
    input.campaignCharacters,
    input.campaignNpcs,
    null,
  )
  const campaignCharacterOptions = [...charactersById.values()].filter(
    (character) => character.id !== input.characterId,
  )
  const locationsQueryStatus = resolveCharacterLocationsQueryStatus({
    campaignId: input.canEdit ? input.campaignId : undefined,
    isPending: input.locationsPending,
    isError: input.locationsError !== null,
    error: input.locationsError,
    hasData: input.locationsHasData,
  })

  return {
    campaignId: input.campaignId,
    characterId: input.characterId,
    availableOrganizations,
    organizationsById,
    locationsById,
    charactersById,
    campaignCharacterOptions,
    eligibleResidenceLocations,
    eligiblePropertyLocations,
    allLocations,
    locationsQueryStatus,
  }
}

export type ConnectionSheetData = ReturnType<typeof buildConnectionSheetData>
