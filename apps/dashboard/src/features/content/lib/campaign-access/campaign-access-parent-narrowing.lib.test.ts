import { describe, expect, it } from 'vitest'

import {
  allowedChildVisibilityModes,
  isChildVisibilityModeAllowed,
} from './campaign-access-parent-narrowing.lib'

describe('allowedChildVisibilityModes', () => {
  it('disallows broadening beyond parent specific_players', () => {
    const modes = allowedChildVisibilityModes({
      available: true,
      visibilityMode: 'specific_players',
      participantIds: ['pc-a'],
      unavailableParticipantIds: [],
      effectiveAudience: 'specific_players',
    })

    expect(modes).toEqual(['specific_players', 'dm_only'])
    expect(
      isChildVisibilityModeAllowed(
        {
          available: true,
          visibilityMode: 'specific_players',
          participantIds: ['pc-a'],
          unavailableParticipantIds: [],
          effectiveAudience: 'specific_players',
        },
        'all_players',
      ),
    ).toBe(false)
  })
})
