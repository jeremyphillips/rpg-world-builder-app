import { isValidObjectId } from 'mongoose'

import type {
  CharacterVitalState,
  CreateNpcServiceInput,
  CreateCharacterInput,
  NpcCharacter,
  PcCharacter,
  SystemRulesetId,
} from '@rpg/contracts'
import { createDefaultCharacterVitalState, normalizeCharacterVital } from '@rpg/contracts'

import type { WithMongoSession } from '../../lib/mongo-session'
import { CharacterModel } from './character.model'
import { toNpcCharacter } from './to-npc-character'
import { toCharacter } from './to-character'

type CharacterRecord = Parameters<typeof toCharacter>[0]

export async function createPcRecord(
  input: CreateCharacterInput,
  userId: string,
  options?: WithMongoSession,
): Promise<PcCharacter> {
  const character = new CharacterModel({
    ...input,
    characterType: 'pc',
    userId,
    rulesetId: input.rulesetId as SystemRulesetId,
    vital: createDefaultCharacterVitalState(),
  })

  await character.save({ session: options?.session })
  return toCharacter(character.toObject() as CharacterRecord)
}

export async function createNpcRecord(input: CreateNpcServiceInput): Promise<NpcCharacter> {
  const doc = await CharacterModel.create({
    ...input,
    characterType: 'npc',
    rulesetId: input.rulesetId as SystemRulesetId,
    vital: createDefaultCharacterVitalState(),
  })

  return toNpcCharacter(doc.toObject() as CharacterRecord)
}

export async function listPcsForUser(userId: string): Promise<PcCharacter[]> {
  const docs = await CharacterModel.find({ userId, characterType: 'pc' })
    .sort({ updatedAt: -1 })
    .lean<CharacterRecord[]>()

  return docs.map(toCharacter)
}

export async function findPcForUser(
  characterId: string,
  userId: string,
  options?: WithMongoSession,
): Promise<PcCharacter | null> {
  if (!isValidObjectId(characterId)) return null

  const doc = await CharacterModel.findOne({
    _id: characterId,
    userId,
    characterType: 'pc',
  })
    .session(options?.session ?? null)
    .lean<CharacterRecord | null>()
  if (!doc) return null

  return toCharacter(doc)
}

export async function findNpcById(npcId: string): Promise<NpcCharacter | null> {
  if (!isValidObjectId(npcId)) return null

  const doc = await CharacterModel.findOne({
    _id: npcId,
    characterType: 'npc',
  }).lean<CharacterRecord | null>()
  if (!doc) return null

  return toNpcCharacter(doc)
}

export async function findNpcsByIds(npcIds: readonly string[]): Promise<NpcCharacter[]> {
  const validIds = npcIds.filter((id) => isValidObjectId(id))
  if (validIds.length === 0) return []

  const docs = await CharacterModel.find({
    _id: { $in: validIds },
    characterType: 'npc',
  }).lean<CharacterRecord[]>()

  return docs.map(toNpcCharacter)
}

export async function findPcsByIds(pcIds: readonly string[]): Promise<PcCharacter[]> {
  const validIds = pcIds.filter((id) => isValidObjectId(id))
  if (validIds.length === 0) return []

  const docs = await CharacterModel.find({
    _id: { $in: validIds },
    characterType: 'pc',
  }).lean<CharacterRecord[]>()

  return docs.map(toCharacter)
}

export async function deletePcForUser(
  characterId: string,
  userId: string,
  options?: WithMongoSession,
): Promise<boolean> {
  if (!isValidObjectId(characterId)) return false

  const result = await CharacterModel.deleteOne({
    _id: characterId,
    userId,
    characterType: 'pc',
  }).session(options?.session ?? null)

  return result.deletedCount === 1
}

export async function deleteNpcById(npcId: string): Promise<boolean> {
  if (!isValidObjectId(npcId)) return false

  const result = await CharacterModel.deleteOne({
    _id: npcId,
    characterType: 'npc',
  })

  return result.deletedCount === 1
}

export async function updateCharacterVitalRecord(
  characterId: string,
  nextVital: CharacterVitalState,
): Promise<boolean> {
  if (!isValidObjectId(characterId)) return false

  const result = await CharacterModel.updateOne(
    { _id: characterId },
    { $set: { vital: nextVital } },
  )

  return result.matchedCount === 1
}

export async function findCharacterVital(characterId: string): Promise<CharacterVitalState | null> {
  if (!isValidObjectId(characterId)) return null

  const doc = await CharacterModel.findById(characterId)
    .select('vital lifecycle')
    .lean<{ vital?: unknown; lifecycle?: { vital?: unknown } }>()
  if (!doc) return null

  // Support legacy lifecycle documents during dev re-seed transition.
  const rawVital = doc.vital ?? doc.lifecycle?.vital
  return normalizeCharacterVital(rawVital)
}
