import type {
  CharacterLifecycle,
  CharacterLifecyclePatch,
  CreateCharacterInput,
  PcCharacter,
} from '@rpg/contracts'
import { applyLifecycleTransitionMetadata } from '@rpg/contracts'

import { assertStandalonePcCreateRestrictions } from './assert-standalone-pc-create'
import {
  createPcRecord,
  deletePcForUser,
  findCharacterLifecycle,
  findPcForUser,
  listPcsForUser,
  updateCharacterLifecycleRecord,
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

type UpdateCharacterLifecycleOptions = {
  timestamp: string
}

export async function updateCharacterLifecycle(
  characterId: string,
  patch: CharacterLifecyclePatch,
  { timestamp }: UpdateCharacterLifecycleOptions,
): Promise<CharacterLifecycle | null> {
  const current = await findCharacterLifecycle(characterId)
  if (!current) return null

  const nextLifecycle = applyLifecycleTransitionMetadata({
    current,
    patch,
    timestamp,
  })

  const updated = await updateCharacterLifecycleRecord(characterId, nextLifecycle)
  return updated ? nextLifecycle : null
}
