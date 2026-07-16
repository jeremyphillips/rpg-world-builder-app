import character133058471 from './fixtures/character-133058471.json'

import {
  dndBeyondCharacterResponseSchema,
  type DndBeyondCharacterResponse,
} from './dnd-beyond-character.schema'

/** Sanitized public character response fixture (D&D Beyond id 133058471). */
export const DND_BEYOND_FIXTURE_CHARACTER_ID = '133058471'

export const dndBeyondCharacter133058471Response: DndBeyondCharacterResponse =
  dndBeyondCharacterResponseSchema.parse(character133058471)

export const dndBeyondCharacter133058471Payload = dndBeyondCharacter133058471Response.data!
