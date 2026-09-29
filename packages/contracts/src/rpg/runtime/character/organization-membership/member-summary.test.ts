import { describe, expect, it } from 'vitest'

import { organizationMembersResponseSchema } from './member-summary'

describe('organizationMembersResponseSchema', () => {
  it('accepts projected membership metadata on roster rows', () => {
    expect(
      organizationMembersResponseSchema.parse({
        items: [
          {
            characterType: 'npc',
            character: {
              id: 'char-1',
              name: 'Aldric',
              summary: 'Human · Level 1 Fighter',
            },
            membership: {
              membershipTitleId: 'omt_captain',
              titleReferenceStatus: 'resolved',
              title: 'Captain',
              priority: 40,
            },
          },
        ],
        total: 1,
      }),
    ).toBeDefined()
  })
})
