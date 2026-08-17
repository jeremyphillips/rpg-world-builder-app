import { describe, expect, it } from 'vitest'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { makeCharacterClass } from '@/test/fixtures/factories/character-class'

import {
  filterCampaignAvailableClasses,
  isCampaignAvailableClass,
  type CampaignAccessClassRow,
} from './filter-campaign-available-classes.lib'

describe('isCampaignAvailableClass', () => {
  it('treats rows without campaignAccess as available', () => {
    expect(isCampaignAvailableClass(makeCharacterClass())).toBe(true)
  })

  it('excludes rows with campaignAccess.available false', () => {
    const unavailable = {
      ...makeCharacterClass({ slug: 'wizard', name: 'Wizard' }),
      campaignAccess: { ...DEFAULT_CONTENT_CAMPAIGN_ACCESS, available: false },
    } satisfies CampaignAccessClassRow

    expect(isCampaignAvailableClass(unavailable)).toBe(false)
  })
})

describe('filterCampaignAvailableClasses', () => {
  it('returns only campaign-available rows', () => {
    const fighter = makeCharacterClass({ slug: 'fighter', name: 'Fighter' })
    const wizard = {
      ...makeCharacterClass({ slug: 'wizard', name: 'Wizard' }),
      campaignAccess: { ...DEFAULT_CONTENT_CAMPAIGN_ACCESS, available: false },
    } satisfies CampaignAccessClassRow

    expect(filterCampaignAvailableClasses([fighter, wizard])).toEqual([fighter])
  })
})
