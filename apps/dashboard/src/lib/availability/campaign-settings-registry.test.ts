import { describe, expect, it } from 'vitest'

import { campaignSettingHref } from './campaign-settings-registry'

describe('campaignSettingHref', () => {
  it('resolves rules-config URLs from the routes SSOT', () => {
    expect(campaignSettingHref('camp_1', 'characterCreation.subclasses.enabled')).toBe(
      '/campaigns/camp_1/homebrew/rules-config/character-configuration#subclasses',
    )
    expect(campaignSettingHref('camp_1', 'characterCreation.multiclassing.enabled')).toBe(
      '/campaigns/camp_1/homebrew/rules-config/character-configuration#multiclassing',
    )
  })
})
