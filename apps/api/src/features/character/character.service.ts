import type { CreateCharacterInput, PcCharacter } from '@rpg/contracts'

import { assertStandalonePcCreateRestrictions } from './assert-standalone-pc-create'
import {
  createPcRecord,
  deletePcForUser,
  findPcForUser,
  listPcsForUser,
} from './character.repository'

export async function createCharacter(
  input: CreateCharacterInput,
  userId: string,
): Promise<PcCharacter> {
  assertStandalonePcCreateRestrictions(input)
  return createPcRecord(input, userId)
}

export async function listCharactersForUser(userId: string): Promise<PcCharacter[]> {
  return listPcsForUser(userId)
}

export async function findCharacterForUser(
  characterId: string,
  userId: string,
): Promise<PcCharacter | null> {
  return findPcForUser(characterId, userId)
}

export async function deleteCharacterForUser(
  characterId: string,
  userId: string,
): Promise<boolean> {
  return deletePcForUser(characterId, userId)
}
