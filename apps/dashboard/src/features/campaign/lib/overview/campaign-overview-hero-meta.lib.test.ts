import { describe, expect, it } from 'vitest'

import {
  buildCampaignOverviewHeroBadges,
  composeCampaignOverviewHeroStatusLine,
} from './campaign-overview-hero-meta.lib'

describe('campaign-overview-hero-meta.lib', () => {
  it('shows status only while counts are pending', () => {
    expect(
      composeCampaignOverviewHeroStatusLine({
        status: 'active',
        countsPending: true,
      }),
    ).toEqual({
      statusLabel: 'Active',
      statusTone: 'success',
    })
  })

  it('pluralizes player counts and omits the character clause when counts match', () => {
    expect(
      composeCampaignOverviewHeroStatusLine({
        status: 'active',
        playerCount: 1,
        characterCount: 1,
      }),
    ).toEqual({
      statusLabel: 'Active',
      statusTone: 'success',
      countsSuffix: '1 player',
    })
  })

  it('includes a character clause when player and character counts differ', () => {
    expect(
      composeCampaignOverviewHeroStatusLine({
        status: 'draft',
        playerCount: 4,
        characterCount: 6,
      }),
    ).toEqual({
      statusLabel: 'Draft',
      statusTone: 'sunken',
      countsSuffix: '4 players · 6 characters',
    })
  })

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
