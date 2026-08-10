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

  it('accepts unique organization memberships with optional titles and priority', () => {
    expect(
      characterConnectionsSchema.parse({
        organizations: [
          { organizationId: 'organization-1' },
          { organizationId: 'organization-2', title: 'Guildmaster', priority: 50 },
        ],
      }),
    ).toEqual({
      organizations: [
        { organizationId: 'organization-1' },
        { organizationId: 'organization-2', title: 'Guildmaster', priority: 50 },
      ],
      locations: [],
    })
  })

  it('trims titles, rejects empty titles, and never invents Member', () => {
    expect(
      characterConnectionsSchema.parse({
        organizations: [{ organizationId: 'organization-1', title: '  Master  ' }],
      }).organizations[0],
    ).toEqual({ organizationId: 'organization-1', title: 'Master' })

    expect(
      characterConnectionsSchema.safeParse({
        organizations: [{ organizationId: 'organization-1', title: '   ' }],
      }).success,
    ).toBe(false)

    expect(
      characterConnectionsSchema.parse({
        organizations: [{ organizationId: 'organization-1' }],
      }).organizations[0],
    ).toEqual({ organizationId: 'organization-1' })
  })

  it('accepts arbitrary persisted title text that is not a suggestion', () => {
    expect(
      characterConnectionsSchema.parse({
        organizations: [{ organizationId: 'organization-1', title: 'Custom Chronicler' }],
      }).organizations[0]?.title,
    ).toBe('Custom Chronicler')
  })

  it('rejects empty and duplicate organization memberships', () => {
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
