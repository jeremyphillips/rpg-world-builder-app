import type { CharacterLocationReferenceResolution, ContentViewer, Location } from '@rpg/contracts'
import { canResolveSavedContentReference } from '@rpg/contracts'

import { CharacterModel } from '../../character'
import { HttpError } from '../../../lib/http-error'
import type { HomebrewDoc } from '../lib/content-write-config'
import { HomebrewLocationModel } from '../locations/homebrew-location.model'
import { toHomebrewLocation } from '../locations/locations.config'

export type LocationReferenceAuthorization =
  | { source: 'campaign-character-access' }
  | { source: 'content-viewer'; viewer: ContentViewer }

export type ResolveCharacterLocationReferencesInput = {
  campaignId: string
  characterId: string
  authorization: LocationReferenceAuthorization
}

function isLocationReferenceAuthorized(
  authorization: LocationReferenceAuthorization,
  characterId: string,
): boolean {
  if (authorization.source === 'campaign-character-access') {
    return true
  }

  return canResolveSavedContentReference(authorization.viewer, { characterId })
}

export async function resolveCharacterLocationReferences({
  campaignId,
  characterId,
  authorization,
}: ResolveCharacterLocationReferencesInput): Promise<
  CharacterLocationReferenceResolution[] | null
> {
  if (!isLocationReferenceAuthorized(authorization, characterId)) {
    throw new HttpError(403, 'forbidden', 'Not authorized to view this character reference.')
  }

  const character = await CharacterModel.findById(characterId).select({ connections: 1 }).lean<{
    connections?: {
      locations?: Array<{ id: string; locationId: string; kind: string }>
    }
  } | null>()
  if (!character) return null

  const connections = character.connections?.locations ?? []
  if (connections.length === 0) return []

  const ids = connections.map(({ locationId }) => locationId)
  const docs = await HomebrewLocationModel.find({
    _id: { $in: ids },
    campaignId,
  }).lean<HomebrewDoc[]>()
  const locationsById = new Map<string, Location>(
    docs.map((doc) => {
      const location = toHomebrewLocation(doc)
      return [location.id, location]
    }),
  )

  return connections.map((connection) => ({
    connection: {
      id: connection.id,
      locationId: connection.locationId,
      kind: connection.kind as CharacterLocationReferenceResolution['connection']['kind'],
    },
    location: locationsById.get(connection.locationId) ?? null,
  }))
}

export async function resolveLocationReference({
  campaignId,
  locationId,
  characterId,
  authorization,
}: ResolveCharacterLocationReferencesInput & { locationId: string }): Promise<Location | null> {
  if (!isLocationReferenceAuthorized(authorization, characterId)) {
    throw new HttpError(403, 'forbidden', 'Not authorized to view this character reference.')
  }

  const doc = await HomebrewLocationModel.findOne({
    _id: locationId,
    campaignId,
  }).lean<HomebrewDoc>()

  return doc ? toHomebrewLocation(doc) : null
}
