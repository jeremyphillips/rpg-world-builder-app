import { describe, expect, it } from 'vitest'

import { characterConnectionsSchema } from './connections'

describe('characterConnectionsSchema', () => {
  it('defaults organizations to an empty array', () => {
    expect(characterConnectionsSchema.parse({})).toEqual({ organizations: [] })
  })

  it('accepts unique organization references', () => {
    expect(
      characterConnectionsSchema.parse({
        organizations: [{ organizationId: 'organization-1' }, { organizationId: 'organization-2' }],
      }),
    ).toEqual({
      organizations: [{ organizationId: 'organization-1' }, { organizationId: 'organization-2' }],
    })
  })

  it('rejects empty and duplicate organization references', () => {
    expect(
      characterConnectionsSchema.safeParse({
        organizations: [{ organizationId: '' }],
      }).success,
    ).toBe(false)
    expect(
      characterConnectionsSchema.safeParse({
        organizations: [{ organizationId: 'organization-1' }, { organizationId: 'organization-1' }],
      }).success,
    ).toBe(false)
  })
})
