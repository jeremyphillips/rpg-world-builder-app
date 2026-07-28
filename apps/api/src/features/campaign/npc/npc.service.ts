import type {
  CampaignNpcDetail,
  CampaignNpcListItem,
  CampaignNpcStatusPatch,
  CreateNpcRequestInput,
  CreateNpcServiceInput,
} from '@rpg/contracts'
import { createDefaultCampaignRosterState } from '@rpg/contracts'

import { findCampaignById } from '../find-campaign-by-id'
import {
  createNpcRecord,
  deleteNpcById,
  findNpcById,
  findNpcsByIds,
  toNpcListCharacterSummary,
  updateCharacterVital,
} from '../../character'
import { HttpError } from '../../../lib/http-error'
import { assertNpcCreateRequestRestrictions } from './assert-npc-create'
import {
  createParticipation,
  deleteAllParticipationsForCharacter,
  findOpenParticipation,
  listOpenParticipationsForCampaign,
  updateCampaignCharacterRoster,
} from '../participation/campaign-character-participation.repository'
function assertNpcIntegrity(
  npcId: string,
  character: Awaited<ReturnType<typeof findNpcById>>,
): asserts character is NonNullable<Awaited<ReturnType<typeof findNpcById>>> {
  if (!character) {
    throw new HttpError(
      500,
      'integrity_error',
      `Participation references missing character ${npcId}.`,
    )
  }
  if (character.characterType !== 'npc') {
    throw new HttpError(500, 'integrity_error', `Expected NPC character ${npcId}.`)
  }
}

export async function createCampaignNpc(
  campaignId: string,
  input: CreateNpcRequestInput,
): Promise<CampaignNpcDetail> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  if (input.rulesetId !== campaign.rulesetId) {
    throw HttpError.badRequest('rulesetId must match the campaign ruleset.')
  }

  assertNpcCreateRequestRestrictions(input)

  const serviceInput: CreateNpcServiceInput = {
    ...input,
    characterType: 'npc',
  }

  const joinedAt = new Date().toISOString()
  const character = await createNpcRecord(serviceInput)

  try {
    const participation = await createParticipation({
      campaignId,
      characterId: character.id,
      joinedAt,
      roster: createDefaultCampaignRosterState(),
    })

    return { character, participation }
  } catch (err) {
    await deleteNpcById(character.id)
    throw err
  }
}

export async function listCampaignNpcs(campaignId: string): Promise<CampaignNpcListItem[]> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const participations = await listOpenParticipationsForCampaign(campaignId)
  const characters = await findNpcsByIds(participations.map((p) => p.characterId))
  const characterById = new Map(characters.map((npc) => [npc.id, npc]))

  const npcs: CampaignNpcListItem[] = []

  for (const participation of participations) {
    const character = characterById.get(participation.characterId)
    if (!character) continue

    npcs.push({
      character: toNpcListCharacterSummary(character),
      participation: {
        id: participation.id,
        roster: participation.roster,
        joinedAt: participation.joinedAt,
      },
    })
  }

  return npcs
}

export async function getCampaignNpc(
  campaignId: string,
  npcId: string,
): Promise<CampaignNpcDetail | null> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const participation = await findOpenParticipation({ campaignId, characterId: npcId })
  if (!participation) return null

  const character = await findNpcById(npcId)
  assertNpcIntegrity(npcId, character)

  return { character: character!, participation }
}

export async function deleteCampaignNpc(campaignId: string, npcId: string): Promise<boolean> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const participation = await findOpenParticipation({ campaignId, characterId: npcId })
  if (!participation) return false

  await deleteAllParticipationsForCharacter(npcId)
  return deleteNpcById(npcId)
}

export async function patchCampaignNpcStatus(
  campaignId: string,
  npcId: string,
  patch: CampaignNpcStatusPatch,
): Promise<CampaignNpcDetail | null> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const existing = await getCampaignNpc(campaignId, npcId)
  if (!existing) return null

  const timestamp = new Date().toISOString()

  if (patch.vital) {
    const updatedVital = await updateCharacterVital(npcId, patch.vital, { timestamp })
    if (!updatedVital) return null
  }

  if (patch.roster) {
    const updatedRoster = await updateCampaignCharacterRoster({
      campaignId,
      characterId: npcId,
      patch: patch.roster,
      timestamp,
    })
    if (!updatedRoster) return null
  }

  return getCampaignNpc(campaignId, npcId)
}
