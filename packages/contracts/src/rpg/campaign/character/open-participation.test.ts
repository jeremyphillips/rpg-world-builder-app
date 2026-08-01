import { describe, expect, it } from 'vitest'

import type { CampaignCharacterParticipation } from './participation'
import { isOpenParticipation } from './open-participation'

describe('isOpenParticipation', () => {
  it('returns true when leftAt is absent', () => {
    const participation = { leftAt: undefined } as Pick<CampaignCharacterParticipation, 'leftAt'>
    expect(isOpenParticipation(participation)).toBe(true)
  })

  it('returns false when leftAt is set', () => {
    const participation = { leftAt: '2026-01-01T00:00:00.000Z' } as Pick<
      CampaignCharacterParticipation,
      'leftAt'
    >
    expect(isOpenParticipation(participation)).toBe(false)
  })
})
