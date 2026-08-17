import { describe, expect, it } from 'vitest'

import {
  characterSummaryDtoSchema,
  organizationMemberSummarySchema,
  organizationMembersResponseSchema,
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
      classIds: [],
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

  it('parses an organization members response envelope', () => {
    expect(
      organizationMembersResponseSchema.parse({
        items: [
          {
            characterType: 'pc',
            character: {
              id: 'char-1',
              name: 'Verna',
              summary: 'Dwarf · Level 1 Fighter',
            },
            membership: { title: 'Captain', priority: 40 },
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
            classIds: [],
          },
          membership: { title: 'Captain', priority: 40 },
        },
      ],
      total: 2,
    })
  })

  it('accepts untitled membership rows', () => {
    expect(
      organizationMemberSummarySchema.parse({
        characterType: 'npc',
        character: {
          id: 'npc-1',
          name: 'Envoy',
          summary: 'Human · Level 1 Rogue',
        },
        membership: {},
      }),
    ).toMatchObject({
      membership: {},
    })
  })
})
