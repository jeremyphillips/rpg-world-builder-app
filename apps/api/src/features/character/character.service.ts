import { isValidObjectId } from 'mongoose'
import type { CreateCharacterInput, PcCharacter, SystemRulesetId } from '@rpg/contracts'

import { assertStandalonePcCreateRestrictions } from './assert-standalone-pc-create'
import { CharacterModel } from './character.model'
import { toCharacter } from './to-character'

type CharacterRecord = Parameters<typeof toCharacter>[0]

export async function createCharacter(
  input: CreateCharacterInput,
  userId: string,
): Promise<PcCharacter> {
  assertStandalonePcCreateRestrictions(input)

  const doc = await CharacterModel.create({
    ...input,
    characterType: 'pc',
    userId,
    campaignId: null,
    rulesetId: input.rulesetId as SystemRulesetId,
  })

  return toCharacter(doc.toObject() as CharacterRecord)
}

export async function listCharactersForUser(userId: string): Promise<PcCharacter[]> {
  const docs = await CharacterModel.find({ userId })
    .sort({ updatedAt: -1 })
    .lean<CharacterRecord[]>()

  return docs.map(toCharacter)
}

export async function findCharacterForUser(
  characterId: string,
  userId: string,
): Promise<PcCharacter | null> {
  if (!isValidObjectId(characterId)) return null

  const doc = await CharacterModel.findOne({
    _id: characterId,
    userId,
  }).lean<CharacterRecord | null>()
  if (!doc) return null

  return toCharacter(doc)
}
