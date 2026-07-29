import { describe, expect, it } from 'vitest'

import {
  characterSummaryDtoSchema,
  organizationConnectedCharactersResponseSchema,
  referencingCharacterSummarySchema,
} from './referencing-character-summary'

describe('referencing character summary contracts', () => {
  it('parses a character summary dto', () => {
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
    })
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

  it('parses an organization connected-characters response envelope', () => {
    expect(
      organizationConnectedCharactersResponseSchema.parse({
        items: [
          {
            characterType: 'pc',
            character: {
              id: 'char-1',
              name: 'Verna',
              summary: 'Dwarf · Level 1 Fighter',
            },
          },
        ],
        total: 2,
      }),
    ).toEqual({
      items: [
        {
          characterType: 'pc',
          character: {
            id: 'char-1',
            name: 'Verna',
            summary: 'Dwarf · Level 1 Fighter',
          },
        },
      ],
      total: 2,
    })
  })
})
