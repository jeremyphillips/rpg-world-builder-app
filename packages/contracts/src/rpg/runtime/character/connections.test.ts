import { describe, expect, it } from 'vitest'

import { characterConnectionsSchema } from './connections'
import { characterLocationConnectionsSchema } from './location-connection'

describe('characterConnectionsSchema', () => {
  it('defaults organizations and locations to empty arrays', () => {
    expect(characterConnectionsSchema.parse({})).toEqual({
      organizations: [],
      locations: [],
    })
  })

  it('accepts unique organization references', () => {
    expect(
      characterConnectionsSchema.parse({
        organizations: [{ organizationId: 'organization-1' }, { organizationId: 'organization-2' }],
      }),
    ).toEqual({
      organizations: [{ organizationId: 'organization-1' }, { organizationId: 'organization-2' }],
      locations: [],
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

describe('characterLocationConnectionsSchema', () => {
  it('accepts unique location connections', () => {
    expect(
      characterLocationConnectionsSchema.parse([
        { id: 'conn-1', locationId: 'loc-1', kind: 'owns' },
        { id: 'conn-2', locationId: 'loc-2', kind: 'resides_at' },
      ]),
    ).toHaveLength(2)
  })

  it('rejects duplicate ids and duplicate location/kind pairs', () => {
    expect(
      characterLocationConnectionsSchema.safeParse([
        { id: 'conn-1', locationId: 'loc-1', kind: 'owns' },
        { id: 'conn-1', locationId: 'loc-2', kind: 'tenant' },
      ]).success,
    ).toBe(false)
    expect(
      characterLocationConnectionsSchema.safeParse([
        { id: 'conn-1', locationId: 'loc-1', kind: 'owns' },
        { id: 'conn-2', locationId: 'loc-1', kind: 'owns' },
      ]).success,
    ).toBe(false)
  })
})
