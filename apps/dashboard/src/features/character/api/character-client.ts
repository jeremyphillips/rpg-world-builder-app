import {
  getCharacterBuilderChromeMessages,
  type CreateCharacterInput,
  type PcCharacter,
  type PcCharacterListItem,
  type SystemRulesetId,
} from '@rpg/contracts'

import { deleteJson, postJson, request } from '@/lib/api-client'

const CREATE_CHARACTER_ERROR = getCharacterBuilderChromeMessages('standalone_pc').createErrorDefault
const DELETE_CHARACTER_ERROR = 'Could not delete character.'
const LIST_CHARACTERS_ERROR = 'Could not load characters.'
const GET_CHARACTER_ERROR = 'Could not load character.'

export async function createCharacter(input: CreateCharacterInput): Promise<PcCharacter> {
  const { character } = await postJson<{ character: PcCharacter }>(
    '/api/characters',
    input,
    CREATE_CHARACTER_ERROR,
  )
  return character
}

export async function listCharacters(): Promise<PcCharacterListItem[]> {
  const { characters } = await request<{ characters: PcCharacterListItem[] }>(
    '/api/characters',
    undefined,
    LIST_CHARACTERS_ERROR,
  )
  return characters
}

export async function getCharacter(characterId: string): Promise<PcCharacter> {
  const { character } = await request<{ character: PcCharacter }>(
    `/api/characters/${characterId}`,
    undefined,
    GET_CHARACTER_ERROR,
  )
  return character
}

export async function deleteCharacter(characterId: string): Promise<void> {
  await deleteJson(`/api/characters/${characterId}`, DELETE_CHARACTER_ERROR)
}

export type { CreateCharacterInput, PcCharacter, SystemRulesetId }
