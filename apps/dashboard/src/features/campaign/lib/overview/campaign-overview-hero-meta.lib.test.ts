import { describe, expect, it } from 'vitest'

import { buildCampaignOverviewHeroBadges } from './campaign-overview-hero-meta.lib'

describe('campaign-overview-hero-meta.lib', () => {
  it('caps flavor badges at four and counts the overflow tail', () => {
    const badges = buildCampaignOverviewHeroBadges({
      playStyle: ['dungeon_crawl', 'exploration', 'sandbox'],
      mood: ['heroic', 'dark_fantasy', 'gritty'],
      magicLevel: 'standard_fantasy',
      difficulty: 'dangerous',
    })

    expect(badges?.visible).toHaveLength(4)
    expect(badges?.overflowCount).toBe(4)
  })

  it('returns undefined when flavor is empty', () => {
    expect(buildCampaignOverviewHeroBadges(undefined)).toBeUndefined()
    expect(buildCampaignOverviewHeroBadges({})).toBeUndefined()
  })
})
