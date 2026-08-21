import { describe, expect, it } from 'vitest'

import {
  organizationMemberSummarySchema,
  organizationMembersResponseSchema,
} from './member-summary'

describe('organization member summary contracts', () => {
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
