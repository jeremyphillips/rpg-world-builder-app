import { describe, expect, it } from 'vitest'

import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { toManagerContentAccessState } from './content-access-metadata.lib'

describe('toManagerContentAccessState', () => {
  it('maps resolved campaign access to manager metadata facts', () => {
    expect(toManagerContentAccessState(DEFAULT_CONTENT_CAMPAIGN_ACCESS)).toEqual({
      available: true,
      visibilityMode: 'all_players',
      selectedParticipantCount: 0,
    })

    expect(
      toManagerContentAccessState({
        ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
        available: false,
        effectiveAudience: 'none',
        visibilityMode: 'dm_only',
        participantIds: ['pc-1', 'pc-2'],
      }),
    ).toEqual({
      available: false,
      visibilityMode: 'dm_only',
      selectedParticipantCount: 2,
    })
  })
})
