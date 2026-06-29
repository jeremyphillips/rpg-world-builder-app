import { describe, expect, it } from 'vitest'

import { createTicketInputSchema, updateTicketInputSchema } from './ticket-input'

describe('createTicketInputSchema', () => {
  it('applies create defaults', () => {
    expect(
      createTicketInputSchema.parse({
        title: 'Capture gap',
        type: 'feature',
        priority: 'medium',
        size: 'm',
        createdBy: 'user',
      }),
    ).toStrictEqual({
      title: 'Capture gap',
      type: 'feature',
      status: 'backlog',
      priority: 'medium',
      size: 'm',
      blockedByTicketIds: [],
      relatedTicketIds: [],
      acceptanceCriteria: [],
      codeRefs: [],
      createdBy: 'user',
    })
  })
})

describe('updateTicketInputSchema', () => {
  it('accepts an empty patch', () => {
    expect(updateTicketInputSchema.safeParse({}).success).toBe(true)
  })

  it('does not inject create defaults', () => {
    expect(updateTicketInputSchema.parse({})).toStrictEqual({})
  })

  it('accepts partial updates', () => {
    expect(updateTicketInputSchema.parse({ status: 'up_next' })).toStrictEqual({
      status: 'up_next',
    })
  })
})
