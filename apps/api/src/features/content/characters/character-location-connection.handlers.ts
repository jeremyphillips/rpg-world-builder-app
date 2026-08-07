import type { Request, Response } from 'express'

import type { CharacterLocationConnection, Location } from '@rpg/contracts'
import {
  createCharacterLocationConnectionInputSchema,
  updateCharacterLocationConnectionInputSchema,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { authorizeCampaignParticipantAccess } from '../../campaign'
import { CharacterModel } from '../../character'
import { HomebrewLocationModel } from '../locations/homebrew-location.model'
import { toHomebrewLocation } from '../locations/locations.config'
import type { HomebrewDoc } from '../lib/content-write-config'
import {
  createCharacterLocationConnectionRecord,
  deleteCharacterLocationConnectionRecord,
  updateCharacterLocationConnectionRecord,
} from './character-location-connection-mutation'

type CharacterLocationConnectionsDocument = {
  connections?: {
    locations?: CharacterLocationConnection[]
  }
}

function toLocationEligibilityInput(location: Location) {
  if (location.kind === 'structure') {
    return { kind: location.kind, structureType: location.structureType }
  }
  return { kind: location.kind }
}

function routeParams(req: Request): { campaignId: string; characterId: string } {
  return req.params as { campaignId: string; characterId: string }
}

function connectionRouteParams(req: Request): {
  campaignId: string
  characterId: string
  connectionId: string
} {
  return req.params as { campaignId: string; characterId: string; connectionId: string }
}

async function loadCharacterForLocationConnectionWrite(
  characterId: string,
): Promise<CharacterLocationConnectionsDocument> {
  const character = await CharacterModel.findById(characterId)
    .select({ connections: 1 })
    .lean<CharacterLocationConnectionsDocument | null>()

  if (!character) {
    throw new HttpError(404, 'not_found', 'Character not found in campaign.')
  }

  return character
}

async function loadCampaignLocation(campaignId: string, locationId: string) {
  const doc = await HomebrewLocationModel.findOne({
    _id: locationId,
    campaignId,
  }).lean<HomebrewDoc>()

  if (!doc) {
    throw new HttpError(
      404,
      'not_found',
      `Location "${locationId}" was not found in this campaign.`,
    )
  }

  return toHomebrewLocation(doc)
}

async function assertCampaignCharacterWriteAccess(req: Request, characterId: string) {
  const { campaignId } = routeParams(req)
  const membership = req.campaignMembership
  if (!membership) {
    throw HttpError.forbidden('Not a member of this campaign')
  }

  const access = await authorizeCampaignParticipantAccess({
    campaignId,
    characterId,
    viewerUserId: req.user!.id,
    viewerRole: membership.campaignRole,
    viewerControlledCharacterIds: membership.pcCharacterIds,
  })

  if (!access.ok) {
    throw access.error
  }

  return { campaignId, characterId }
}

export async function createCharacterLocationConnectionItem(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId, characterId } = await assertCampaignCharacterWriteAccess(
    req,
    routeParams(req).characterId,
  )
  const body = createCharacterLocationConnectionInputSchema.parse(req.body)
  const character = await loadCharacterForLocationConnectionWrite(characterId)
  const location = await loadCampaignLocation(campaignId, body.locationId)

  const result = await createCharacterLocationConnectionRecord({
    characterId,
    character,
    location: toLocationEligibilityInput(location),
    body,
  })

  res.status(201).json({ locationConnection: result.connection })
}

export async function updateCharacterLocationConnectionItem(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId, characterId } = await assertCampaignCharacterWriteAccess(
    req,
    connectionRouteParams(req).characterId,
  )
  const { connectionId } = connectionRouteParams(req)
  const body = updateCharacterLocationConnectionInputSchema.parse(req.body)
  const character = await loadCharacterForLocationConnectionWrite(characterId)

  const existingConnection = character.connections?.locations?.find(
    (connection) => connection.id === connectionId,
  )

  if (!existingConnection) {
    throw new HttpError(
      404,
      'not_found',
      `Location connection "${connectionId}" was not found on this character.`,
    )
  }

  const targetLocationId = body.locationId ?? existingConnection.locationId
  const location = await loadCampaignLocation(campaignId, targetLocationId)

  const result = await updateCharacterLocationConnectionRecord({
    characterId,
    character,
    location: toLocationEligibilityInput(location),
    connectionId,
    body,
  })

  res.status(200).json({ locationConnection: result.connection })
}

export async function deleteCharacterLocationConnectionItem(
  req: Request,
  res: Response,
): Promise<void> {
  const { characterId } = await assertCampaignCharacterWriteAccess(
    req,
    connectionRouteParams(req).characterId,
  )
  const { connectionId } = connectionRouteParams(req)
  const character = await loadCharacterForLocationConnectionWrite(characterId)

  await deleteCharacterLocationConnectionRecord({
    characterId,
    character,
    connectionId,
  })

  res.status(200).json({ ok: true })
}
