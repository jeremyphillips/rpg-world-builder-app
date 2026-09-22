import type {
  CampaignNpcDetail,
  CampaignNpcListItem,
  CampaignNpcStatusPatch,
  ContentDeletionResult,
  CreateNpcRequestInput,
  CreateNpcServiceInput,
} from '@rpg/contracts'
import { createDefaultCampaignRosterState, getCharacterTotalLevel } from '@rpg/contracts'

import { findCampaignById } from '../find-campaign-by-id'
import {
  createNpcRecord,
  deleteNpcById,
  findNpcById,
  findNpcsByIds,
  toNpcListCharacterSummary,
  updateCharacterVital,
} from '../../character'
import { createCharacterRelationshipsFromDraftEdges } from '../../character-relationships/lib/create-character-relationships-from-draft'
import { HttpError } from '../../../lib/http-error'
import { areMongoTransactionsEnabled, runInTransaction } from '../../../lib/mongo-transaction'
import type { WithMongoSession } from '../../../lib/mongo-session'
import { assertNpcCreateRequestRestrictions } from './assert-npc-create'
import { getRulesetPatchRead } from '../../vocabulary'
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

async function assertLevelZeroNpcCreatePermitted(
  campaignId: string,
  input: CreateNpcRequestInput,
): Promise<void> {
  if (getCharacterTotalLevel(input) !== 0) return

  if (input.classes.length > 0) {
    throw HttpError.badRequest('Level 0 NPCs cannot have classes.')
  }

  const rules = await getRulesetPatchRead(campaignId)
  if (!rules?.characterCreation.levelZeroNpcs.enabled) {
    throw HttpError.badRequest('Level 0 NPCs are not enabled for this campaign.')
  }
}

async function createNpcParticipationAndEdges(input: {
  campaignId: string
  actorUserId: string
  characterInput: CreateNpcServiceInput
  relationshipEdges: CreateNpcRequestInput['relationshipEdges']
  joinedAt: string
  options?: WithMongoSession
}): Promise<CampaignNpcDetail> {
  const character = await createNpcRecord(input.characterInput, input.options)
  const participation = await createParticipation(
    {
      campaignId: input.campaignId,
      characterId: character.id,
      joinedAt: input.joinedAt,
      roster: createDefaultCampaignRosterState(),
    },
    input.options,
  )

  const edges = input.relationshipEdges ?? []
  if (edges.length > 0) {
    await createCharacterRelationshipsFromDraftEdges({
      campaignId: input.campaignId,
      actorUserId: input.actorUserId,
      characterId: character.id,
      edges,
      options: input.options,
    })
  }

  return { character, participation }
}

export async function createCampaignNpc(
  campaignId: string,
  actorUserId: string,
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
  await assertLevelZeroNpcCreatePermitted(campaignId, input)

  const { relationshipEdges, ...characterFields } = input
  const characterInput: CreateNpcServiceInput = {
    ...characterFields,
    characterType: 'npc',
  }

  const joinedAt = new Date().toISOString()

  if (areMongoTransactionsEnabled()) {
    return runInTransaction((session) =>
      createNpcParticipationAndEdges({
        campaignId,
        actorUserId,
        characterInput,
        relationshipEdges,
        joinedAt,
        options: { session },
      }),
    )
  }

  const character = await createNpcRecord(characterInput)

  try {
    const participation = await createParticipation({
      campaignId,
      characterId: character.id,
      joinedAt,
      roster: createDefaultCampaignRosterState(),
    })

    const edges = relationshipEdges ?? []
    if (edges.length > 0) {
      await createCharacterRelationshipsFromDraftEdges({
        campaignId,
        actorUserId,
        characterId: character.id,
        edges,
      })
    }

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

export async function deleteCampaignNpc(
  campaignId: string,
  npcId: string,
): Promise<ContentDeletionResult | { status: 'not_found' }> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const participation = await findOpenParticipation({ campaignId, characterId: npcId })
  if (!participation) return { status: 'not_found' }

  await deleteAllParticipationsForCharacter(npcId)
  const deleted = await deleteNpcById(npcId)
  if (!deleted) {
    return { status: 'not_found' }
  }

  return { status: 'deleted' }
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
