import type { CreateCharacterRelationshipInput } from '@rpg/contracts'
import {
  getCharacterRelationshipEdgeKindEntry,
  isCharacterLocationConnectionEligible,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import type { WithMongoSession } from '../../../lib/mongo-session'
import { findOpenParticipationForCharacter } from '../../campaign/participation/campaign-character-participation.repository'
import { findNpcById, findPcById } from '../../character'
import type { HomebrewDoc } from '../../content/lib/content-write-config'
import { HomebrewLocationModel } from '../../content/locations/homebrew-location.model'
import { toHomebrewLocation } from '../../content/locations/locations.config'
import { HomebrewOrganizationModel } from '../../content/organizations/homebrew-organization.model'

async function assertCharacterParticipatesInCampaign(
  campaignId: string,
  characterId: string,
  options?: WithMongoSession,
): Promise<void> {
  const participation = await findOpenParticipationForCharacter(characterId, options)
  if (!participation || participation.campaignId !== campaignId) {
    throw new HttpError(
      404,
      'not_found',
      `Character "${characterId}" was not found in this campaign.`,
    )
  }
}

async function assertOrganizationExistsInCampaign(
  campaignId: string,
  organizationId: string,
  options?: WithMongoSession,
): Promise<void> {
  const exists = await HomebrewOrganizationModel.exists({
    _id: organizationId,
    campaignId,
  }).session(options?.session ?? null)
  if (!exists) {
    throw new HttpError(
      404,
      'not_found',
      `Organization "${organizationId}" was not found in this campaign.`,
    )
  }
}

async function loadCampaignLocation(
  campaignId: string,
  locationId: string,
  options?: WithMongoSession,
) {
  const doc = await HomebrewLocationModel.findOne({
    _id: locationId,
    campaignId,
  })
    .lean<HomebrewDoc>()
    .session(options?.session ?? null)
  if (!doc) {
    throw new HttpError(
      404,
      'not_found',
      `Location "${locationId}" was not found in this campaign.`,
    )
  }
  return toHomebrewLocation(doc)
}

function toLocationEligibilityInput(location: ReturnType<typeof toHomebrewLocation>) {
  if (location.kind === 'structure') {
    return { kind: location.kind, structureType: location.structureType }
  }
  return { kind: location.kind }
}

async function assertEligibleLocationConnection(
  campaignId: string,
  input: Extract<
    CreateCharacterRelationshipInput,
    { kind: 'resides_at' | 'owns' | 'tenant' | 'operator' | 'works_at' }
  >,
  options?: WithMongoSession,
): Promise<void> {
  const location = await loadCampaignLocation(campaignId, input.locationId, options)
  if (!isCharacterLocationConnectionEligible(toLocationEligibilityInput(location), input.kind)) {
    throw new HttpError(
      400,
      'validation_error',
      `Connection kind "${input.kind}" is not valid for this location.`,
    )
  }
}

async function assertRelatedCharacterEndpoints(
  campaignId: string,
  characterId: string,
  relatedCharacterId: string,
  options?: WithMongoSession,
): Promise<void> {
  if (characterId === relatedCharacterId) {
    throw new HttpError(409, 'conflict', 'A character cannot have a relationship with itself.')
  }

  const relatedPc = await findPcById(relatedCharacterId, options)
  const relatedNpc = relatedPc ? null : await findNpcById(relatedCharacterId)
  if (!relatedPc && !relatedNpc) {
    throw new HttpError(404, 'not_found', `Character "${relatedCharacterId}" was not found.`)
  }

  await assertCharacterParticipatesInCampaign(campaignId, relatedCharacterId, options)
}

export async function assertCreateCharacterRelationshipEndpoints(
  campaignId: string,
  input: CreateCharacterRelationshipInput,
  options?: WithMongoSession,
): Promise<void> {
  await assertCharacterParticipatesInCampaign(campaignId, input.characterId, options)

  const endpointType = getCharacterRelationshipEdgeKindEntry(input.kind)?.endpointType

  if (endpointType === 'organization') {
    await assertOrganizationExistsInCampaign(
      campaignId,
      (input as Extract<CreateCharacterRelationshipInput, { organizationId: string }>)
        .organizationId,
      options,
    )
    return
  }

  if (endpointType === 'location') {
    if (input.kind === 'hometown' || input.kind === 'birthplace') {
      await loadCampaignLocation(
        campaignId,
        (input as Extract<CreateCharacterRelationshipInput, { locationId: string }>).locationId,
        options,
      )
      return
    }

    await assertEligibleLocationConnection(
      campaignId,
      input as Extract<
        CreateCharacterRelationshipInput,
        { kind: 'resides_at' | 'owns' | 'tenant' | 'operator' | 'works_at' }
      >,
      options,
    )
    return
  }

  if (endpointType === 'character') {
    await assertRelatedCharacterEndpoints(
      campaignId,
      input.characterId,
      (input as Extract<CreateCharacterRelationshipInput, { relatedCharacterId: string }>)
        .relatedCharacterId,
      options,
    )
    return
  }

  throw new HttpError(400, 'validation_error', 'Unsupported relationship kind.')
}
