import { isValidObjectId } from 'mongoose'

import type {
  CharacterLifecycle,
  CreateNpcServiceInput,
  CreateCharacterInput,
  NpcCharacter,
  PcCharacter,
  SystemRulesetId,
} from '@rpg/contracts'
import { createDefaultCharacterLifecycle, normalizeCharacterLifecycle } from '@rpg/contracts'

import { CharacterModel } from './character.model'
import { toNpcCharacter } from './to-npc-character'
import { toCharacter } from './to-character'

type CharacterRecord = Parameters<typeof toCharacter>[0]

export async function createPcRecord(
  input: CreateCharacterInput,
  userId: string,
): Promise<PcCharacter> {
  const doc = await CharacterModel.create({
    ...input,
    characterType: 'pc',
    userId,
    campaignId: input.campaignId ?? null,
    rulesetId: input.rulesetId as SystemRulesetId,
    lifecycle: createDefaultCharacterLifecycle(),
  })

  return toCharacter(doc.toObject() as CharacterRecord)
}

export async function createNpcRecord(input: CreateNpcServiceInput): Promise<NpcCharacter> {
  const doc = await CharacterModel.create({
    ...input,
    characterType: 'npc',
    campaignId: input.campaignId,
    rulesetId: input.rulesetId as SystemRulesetId,
    lifecycle: createDefaultCharacterLifecycle(),
  })

  return toNpcCharacter(doc.toObject() as CharacterRecord)
}

export async function listPcsForUser(userId: string): Promise<PcCharacter[]> {
  const docs = await CharacterModel.find({ userId, characterType: 'pc' })
    .sort({ updatedAt: -1 })
    .lean<CharacterRecord[]>()

  return docs.map(toCharacter)
}

export async function listNpcsForCampaign(campaignId: string): Promise<NpcCharacter[]> {
  const docs = await CharacterModel.find({ campaignId, characterType: 'npc' })
    .sort({ updatedAt: -1 })
    .lean<CharacterRecord[]>()

  return docs.map(toNpcCharacter)
}

export async function findPcForUser(
  characterId: string,
  userId: string,
): Promise<PcCharacter | null> {
  if (!isValidObjectId(characterId)) return null

  const doc = await CharacterModel.findOne({
    _id: characterId,
    userId,
    characterType: 'pc',
  }).lean<CharacterRecord | null>()
  if (!doc) return null

  return toCharacter(doc)
}

export async function findNpcForCampaign(
  npcId: string,
  campaignId: string,
): Promise<NpcCharacter | null> {
  if (!isValidObjectId(npcId)) return null

  const doc = await CharacterModel.findOne({
    _id: npcId,
    campaignId,
    characterType: 'npc',
  }).lean<CharacterRecord | null>()
  if (!doc) return null

  return toNpcCharacter(doc)
}

export async function deletePcForUser(characterId: string, userId: string): Promise<boolean> {
  if (!isValidObjectId(characterId)) return false

  const result = await CharacterModel.deleteOne({
    _id: characterId,
    userId,
    characterType: 'pc',
  })

  return result.deletedCount === 1
}

export async function deleteNpcForCampaign(npcId: string, campaignId: string): Promise<boolean> {
  if (!isValidObjectId(npcId)) return false

  const result = await CharacterModel.deleteOne({
    _id: npcId,
    campaignId,
    characterType: 'npc',
  })

  return result.deletedCount === 1
}

export async function updateCharacterLifecycleRecord(
  characterId: string,
  nextLifecycle: CharacterLifecycle,
): Promise<boolean> {
  if (!isValidObjectId(characterId)) return false

  const result = await CharacterModel.updateOne(
    { _id: characterId },
    { $set: { lifecycle: nextLifecycle } },
  )

  return result.matchedCount === 1
}

export async function findCharacterLifecycle(
  characterId: string,
): Promise<CharacterLifecycle | null> {
  if (!isValidObjectId(characterId)) return null

  const doc = await CharacterModel.findById(characterId)
    .select('lifecycle')
    .lean<{ lifecycle?: unknown }>()
  if (!doc) return null

  return normalizeCharacterLifecycle(doc.lifecycle)
}
