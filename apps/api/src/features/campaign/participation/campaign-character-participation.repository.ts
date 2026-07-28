import { isValidObjectId } from 'mongoose'

import type {
  CampaignCharacterParticipation,
  CampaignRosterPatch,
  CharacterRosterState,
  CreateCampaignCharacterParticipationInput,
} from '@rpg/contracts'
import {
  applyCampaignRosterTransitionMetadata,
  campaignCharacterParticipationSchema,
  createDefaultCampaignRosterState,
} from '@rpg/contracts'

import type { WithMongoSession } from '../../../lib/mongo-session'
import { CampaignCharacterParticipationModel } from './campaign-character-participation.model'

type ParticipationRecord = {
  _id: unknown
  campaignId: string
  characterId: string
  roster: unknown
  joinedAt: Date
  leftAt?: Date
  createdAt: Date
  updatedAt: Date
}

const OPEN_PARTICIPATION_FILTER = { leftAt: { $exists: false } } as const

function toParticipation(doc: ParticipationRecord): CampaignCharacterParticipation {
  return campaignCharacterParticipationSchema.parse({
    id: String(doc._id),
    campaignId: doc.campaignId,
    characterId: doc.characterId,
    roster: doc.roster,
    joinedAt: doc.joinedAt.toISOString(),
    ...(doc.leftAt !== undefined ? { leftAt: doc.leftAt.toISOString() } : {}),
  })
}

export async function createParticipation(
  input: CreateCampaignCharacterParticipationInput,
  options?: WithMongoSession,
): Promise<CampaignCharacterParticipation> {
  const doc = await CampaignCharacterParticipationModel.create(
    [
      {
        campaignId: input.campaignId,
        characterId: input.characterId,
        roster: input.roster,
        joinedAt: new Date(input.joinedAt),
      },
    ],
    { session: options?.session },
  )

  return toParticipation(doc[0]!.toObject() as ParticipationRecord)
}

export async function findOpenParticipation({
  campaignId,
  characterId,
}: {
  campaignId: string
  characterId: string
}): Promise<CampaignCharacterParticipation | null> {
  if (!isValidObjectId(characterId)) return null

  const doc = await CampaignCharacterParticipationModel.findOne({
    campaignId,
    characterId,
    ...OPEN_PARTICIPATION_FILTER,
  }).lean<ParticipationRecord | null>()

  return doc ? toParticipation(doc) : null
}

export async function findOpenParticipationForCharacter(
  characterId: string,
  options?: WithMongoSession,
): Promise<CampaignCharacterParticipation | null> {
  if (!isValidObjectId(characterId)) return null

  const doc = await CampaignCharacterParticipationModel.findOne({
    characterId,
    ...OPEN_PARTICIPATION_FILTER,
  })
    .session(options?.session ?? null)
    .lean<ParticipationRecord | null>()

  return doc ? toParticipation(doc) : null
}

export async function listOpenParticipationsForCampaign(
  campaignId: string,
): Promise<CampaignCharacterParticipation[]> {
  const docs = await CampaignCharacterParticipationModel.find({
    campaignId,
    ...OPEN_PARTICIPATION_FILTER,
  })
    .sort({ joinedAt: -1 })
    .lean<ParticipationRecord[]>()

  return docs.map(toParticipation)
}

export async function listOpenParticipationsForCharacters(
  characterIds: readonly string[],
): Promise<CampaignCharacterParticipation[]> {
  const validIds = characterIds.filter((id) => isValidObjectId(id))
  if (validIds.length === 0) return []

  const docs = await CampaignCharacterParticipationModel.find({
    characterId: { $in: validIds },
    ...OPEN_PARTICIPATION_FILTER,
  }).lean<ParticipationRecord[]>()

  return docs.map(toParticipation)
}

export async function listOpenPcParticipationCharacterIdsForCampaign(
  campaignId: string,
): Promise<string[]> {
  const participations = await listOpenParticipationsForCampaign(campaignId)
  return participations.map((participation) => participation.characterId)
}

export async function intersectControlledWithOpenParticipations(
  campaignId: string,
  controlledCharacterIds: readonly string[],
): Promise<string[]> {
  if (controlledCharacterIds.length === 0) return []

  const openCharacterIds = new Set(await listOpenPcParticipationCharacterIdsForCampaign(campaignId))

  return controlledCharacterIds.filter((characterId) => openCharacterIds.has(characterId))
}

export async function updateParticipationRoster({
  campaignId,
  characterId,
  nextRoster,
}: {
  campaignId: string
  characterId: string
  nextRoster: CharacterRosterState
}): Promise<boolean> {
  if (!isValidObjectId(characterId)) return false

  const result = await CampaignCharacterParticipationModel.updateOne(
    { campaignId, characterId, ...OPEN_PARTICIPATION_FILTER },
    { $set: { roster: nextRoster } },
  )

  return result.matchedCount === 1
}

export async function findParticipationRoster(
  campaignId: string,
  characterId: string,
): Promise<CharacterRosterState | null> {
  const participation = await findOpenParticipation({ campaignId, characterId })
  return participation?.roster ?? null
}

export async function deleteOpenParticipation({
  campaignId,
  characterId,
  session,
}: {
  campaignId: string
  characterId: string
  session?: WithMongoSession['session']
}): Promise<boolean> {
  if (!isValidObjectId(characterId)) return false

  const result = await CampaignCharacterParticipationModel.deleteOne({
    campaignId,
    characterId,
    ...OPEN_PARTICIPATION_FILTER,
  }).session(session ?? null)

  return result.deletedCount === 1
}

/** Targeted detach of open participation for one campaign (invite-completion rollback). */
export async function detachOpenParticipation({
  campaignId,
  characterId,
  session,
}: {
  campaignId: string
  characterId: string
  session?: WithMongoSession['session']
}): Promise<boolean> {
  return deleteOpenParticipation({ campaignId, characterId, session })
}

export async function deleteAllParticipationsForCharacter(
  characterId: string,
  options?: WithMongoSession,
): Promise<void> {
  if (!isValidObjectId(characterId)) return

  await CampaignCharacterParticipationModel.deleteMany({ characterId }).session(
    options?.session ?? null,
  )
}

export async function updateCampaignCharacterRoster({
  campaignId,
  characterId,
  patch,
  timestamp,
}: {
  campaignId: string
  characterId: string
  patch: CampaignRosterPatch
  timestamp: string
}): Promise<CharacterRosterState | null> {
  const participation = await findOpenParticipation({ campaignId, characterId })
  if (!participation) return null

  const nextRoster = applyCampaignRosterTransitionMetadata({
    current: participation.roster,
    patch,
    timestamp,
  })

  const updated = await updateParticipationRoster({ campaignId, characterId, nextRoster })
  return updated ? nextRoster : null
}

export async function attachCharacterToCampaign({
  campaignId,
  characterId,
  joinedAt,
  session,
}: {
  campaignId: string
  characterId: string
  joinedAt: string
  session?: WithMongoSession['session']
}): Promise<CampaignCharacterParticipation> {
  const existing = await findOpenParticipationForCharacter(characterId, { session })
  if (existing) {
    throw new Error(
      `Character ${characterId} already has open participation in campaign ${existing.campaignId}`,
    )
  }

  return createParticipation(
    {
      campaignId,
      characterId,
      joinedAt,
      roster: createDefaultCampaignRosterState(),
    },
    { session },
  )
}
