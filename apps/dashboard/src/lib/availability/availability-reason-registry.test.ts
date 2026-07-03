import { describe, expect, it } from 'vitest'

import {
  getAvailabilityReasonDefinition,
  resolveReasonAction,
} from './availability-reason-registry'

describe('availability reason registry', () => {
  it('builds subclass settings actions from campaign context', () => {
    const action = resolveReasonAction(
      { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
      { campaignId: 'camp_1' },
    )

    expect(action).toEqual({
      label: 'Enable subclasses',
      href: '/campaigns/camp_1/homebrew/rules-config/character-configuration#subclasses',
    })
  })

  it('builds multiclassing settings actions from campaign context', () => {
    const action = resolveReasonAction(
      { code: 'multiclassing-disabled', settingId: 'characterCreation.multiclassing.enabled' },
      { campaignId: 'camp_1' },
    )

    expect(action).toEqual({
      label: 'Edit multiclassing rules',
      href: '/campaigns/camp_1/homebrew/rules-config/character-configuration#multiclassing',
    })
  })

  it('does not provide an action for manual campaign availability', () => {
    expect(
      resolveReasonAction({ code: 'not-available-in-campaign' }, { campaignId: 'camp_1' }),
    ).toBeUndefined()
    expect(getAvailabilityReasonDefinition('not-available-in-campaign').badgeLabel).toBe('Inactive')
  })
})
