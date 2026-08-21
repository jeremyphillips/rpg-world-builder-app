import { describe, expect, it } from 'vitest'

import { referencingCharacterSummarySchema } from './referencing-summary'
import { characterCardSummarySchema, characterSummaryDtoSchema } from './character-card-dtos'

describe('referencing character summary contracts', () => {
  it('parses a character summary dto alias', () => {
    expect(
      characterSummaryDtoSchema.parse({
        id: 'char-1',
        name: 'Verna',
        summary: 'Dwarf · Level 1 Fighter',
      }),
    ).toEqual({
      id: 'char-1',
      name: 'Verna',
      summary: 'Dwarf · Level 1 Fighter',
      classIds: [],
    })
    expect(characterSummaryDtoSchema).toBe(characterCardSummarySchema)
  })

  it('parses a referencing character summary', () => {
    expect(
      referencingCharacterSummarySchema.parse({
        characterType: 'npc',
        character: {
          id: 'npc-1',
          name: 'Circle Envoy',
          summary: 'Human · Level 3 Rogue',
        },
      }),
    ).toMatchObject({
      characterType: 'npc',
      character: { id: 'npc-1' },
    })
  })
})
