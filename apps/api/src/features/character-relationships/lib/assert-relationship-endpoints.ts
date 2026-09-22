import type { CreateCharacterRelationshipInput } from '@rpg/contracts'
import { isCharacterLocationConnectionEligible } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { findOpenParticipationForCharacter } from '../../campaign'
import { findNpcById, findPcById } from '../../character'
import {
  HomebrewLocationModel,
  HomebrewOrganizationModel,
  toHomebrewLocation,
  type HomebrewDoc,
} from '../../content'

const ELIGIBLE_LOCATION_CONNECTION_KINDS = new Set([
  'resides_at',
  'owns',
  'tenant',
  'operator',
  'works_at',
])

async function assertCharacterParticipatesInCampaign(
  campaignId: string,
  characterId: string,
): Promise<void> {
  const participation = await findOpenParticipationForCharacter(characterId)
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
): Promise<void> {
  const exists = await HomebrewOrganizationModel.exists({ _id: organizationId, campaignId })
  if (!exists) {
    throw new HttpError(
      404,
      'not_found',
      `Organization "${organizationId}" was not found in this campaign.`,
    )
  }
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
): Promise<void> {
  const location = await loadCampaignLocation(campaignId, input.locationId)
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
): Promise<void> {
  if (characterId === relatedCharacterId) {
    throw new HttpError(409, 'conflict', 'A character cannot have a relationship with itself.')
  }

  const relatedPc = await findPcById(relatedCharacterId)
  const relatedNpc = relatedPc ? null : await findNpcById(relatedCharacterId)
  if (!relatedPc && !relatedNpc) {
    throw new HttpError(404, 'not_found', `Character "${relatedCharacterId}" was not found.`)
  }

  await assertCharacterParticipatesInCampaign(campaignId, relatedCharacterId)
}

export async function assertCreateCharacterRelationshipEndpoints(
  campaignId: string,
  input: CreateCharacterRelationshipInput,
): Promise<void> {
  await assertCharacterParticipatesInCampaign(campaignId, input.characterId)

  if (input.kind === 'organizationMembership') {
    await assertOrganizationExistsInCampaign(campaignId, input.organizationId)
    return
  }

  if (ELIGIBLE_LOCATION_CONNECTION_KINDS.has(input.kind)) {
    await assertEligibleLocationConnection(
      campaignId,
      input as Extract<
        CreateCharacterRelationshipInput,
        { kind: 'resides_at' | 'owns' | 'tenant' | 'operator' | 'works_at' }
      >,
    )
    return
  }

  if (input.kind === 'hometown' || input.kind === 'birthplace') {
    await loadCampaignLocation(campaignId, input.locationId)
    return
  }

  if (!('relatedCharacterId' in input)) {
    throw new HttpError(
      400,
      'validation_error',
      'Related character is required for this relationship kind.',
    )
  }

  await assertRelatedCharacterEndpoints(campaignId, input.characterId, input.relatedCharacterId)
}
