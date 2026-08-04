import type {
  CharacterVitalPatch,
  CharacterVitalState,
  ContentDeletionResult,
  CreateCharacterInput,
  PcCharacter,
} from '@rpg/contracts'
import { applyCharacterVitalTransitionMetadata } from '@rpg/contracts'

import { assertStandalonePcCreateRestrictions } from './assert-standalone-pc-create'
import { getCharacterLocationPartyDeletionBlockers } from './character-deletion.service'
import {
  createPcRecord,
  deletePcForUser,
  findCharacterVital,
  findPcForUser,
  listPcsForUser,
  updateCharacterVitalRecord,
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
): Promise<ContentDeletionResult | { status: 'not_found' }> {
  const blockers = await getCharacterLocationPartyDeletionBlockers(characterId)
  if (blockers.length > 0) {
    return { status: 'blocked', blockers }
  }

  const deleted = await deletePcForUser(characterId, userId)
  if (!deleted) {
    return { status: 'not_found' }
  }

  return { status: 'deleted' }
}

type UpdateCharacterVitalOptions = {
  timestamp: string
}

export async function updateCharacterVital(
  characterId: string,
  patch: CharacterVitalPatch,
  { timestamp }: UpdateCharacterVitalOptions,
): Promise<CharacterVitalState | null> {
  const current = await findCharacterVital(characterId)
  if (!current) return null

  const nextVital = applyCharacterVitalTransitionMetadata({
    current,
    patch,
    timestamp,
  })

  const updated = await updateCharacterVitalRecord(characterId, nextVital)
  return updated ? nextVital : null
}
