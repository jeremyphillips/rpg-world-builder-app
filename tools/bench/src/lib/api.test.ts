import { describe, expect, it } from 'vitest'

import { buildListTicketsQuery } from './api'

describe('buildListTicketsQuery', () => {
  it('maps CLI flags to API query params', () => {
    expect(
      buildListTicketsQuery({
        status: 'backlog',
        'epic-id': 'epic-123',
        'epic-name': 'Character Builder',
        bucket: 'open',
        area: 'rules',
        type: 'feature',
        priority: 'high',
        size: 'm',
        'created-by': 'agent',
      }),
    ).toEqual({
      status: 'backlog',
      epicId: 'epic-123',
      epicName: 'Character Builder',
      bucket: 'open',
      area: 'rules',
      type: 'feature',
      priority: 'high',
      size: 'm',
      createdBy: 'agent',
    })
  })

  it('returns empty query when no flags are set', () => {
    expect(buildListTicketsQuery({})).toEqual({})
  })
})
