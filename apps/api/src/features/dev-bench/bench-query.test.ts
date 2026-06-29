import { describe, expect, it } from 'vitest'

import { listTicketsQuerySchema } from './bench-query'

describe('listTicketsQuerySchema', () => {
  it('accepts epicName and bucket filters', () => {
    const parsed = listTicketsQuerySchema.safeParse({
      epicName: 'Character Builder',
      bucket: 'active',
    })

    expect(parsed.success).toBe(true)
  })

  it('rejects bucket and status together', () => {
    const parsed = listTicketsQuerySchema.safeParse({
      status: 'backlog',
      bucket: 'active',
    })

    expect(parsed.success).toBe(false)
  })
})
