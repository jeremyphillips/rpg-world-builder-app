import type { CampaignCharacterListItem, CampaignPartyPcListItem } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  normalizeListController,
  normalizePartyController,
  resolveCharacterControllerDisplay,
} from './character-controller-display'
import { CHARACTER_CONTROLLER_DISPLAY } from './character-display-labels'

describe('character controller display', () => {
  it('returns no-player copy when controller is absent', () => {
    expect(
      resolveCharacterControllerDisplay({
        controller: null,
        viewerControlsCharacter: false,
      }),
    ).toBe(CHARACTER_CONTROLLER_DISPLAY.noPlayerAssigned)
  })

  it('returns played-by-you copy when the viewer controls the character', () => {
    expect(
      resolveCharacterControllerDisplay({
        controller: { displayName: 'Player One' },
        viewerControlsCharacter: true,
      }),
    ).toBe(CHARACTER_CONTROLLER_DISPLAY.playedByYou)
  })

  it('returns played-by copy for other controllers', () => {
    expect(
      resolveCharacterControllerDisplay({
        controller: { displayName: 'Player One' },
        viewerControlsCharacter: false,
      }),
    ).toBe(CHARACTER_CONTROLLER_DISPLAY.playedBy('Player One'))
  })

  it('normalizes party member and list controller refs', () => {
    const member: CampaignPartyPcListItem['member'] = {
      id: 'member_1',
      displayName: 'Player One',
    }
    const controller: CampaignCharacterListItem['controller'] = {
      membershipId: 'member_2',
      displayName: 'Player Two',
    }

    expect(normalizePartyController(member)).toEqual({ displayName: 'Player One' })
    expect(normalizePartyController(null)).toBeNull()
    expect(normalizeListController(controller)).toEqual({ displayName: 'Player Two' })
    expect(normalizeListController(null)).toBeNull()
  })
})
