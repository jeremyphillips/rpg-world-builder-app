import type { PcCharacter, CreateCharacterInput, SystemRulesetId } from '@rpg/contracts'

import { postJson, request } from '@/lib/api-client'

const CREATE_CHARACTER_ERROR = 'Could not create character.'
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

export async function listCharacters(): Promise<PcCharacter[]> {
  const { characters } = await request<{ characters: PcCharacter[] }>(
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

export type { CreateCharacterInput, PcCharacter, SystemRulesetId }
