import { describe, expect, it } from 'vitest'

import {
  DEFAULT_GAME_MASTER_DISPLAY_STYLE,
  formatCampaignOpenPcCount,
  formatCampaignPlayerMemberCount,
  resolveCampaignStatusLabel,
  resolveCampaignViewerFacetLabel,
  resolveGameMasterShortLabel,
} from './campaign-display-vocab'

describe('resolveGameMasterShortLabel', () => {
  it('returns GM or DM from the display style', () => {
    expect(resolveGameMasterShortLabel('gm')).toBe('GM')
    expect(resolveGameMasterShortLabel('dm')).toBe('DM')
  })
})

describe('resolveCampaignViewerFacetLabel', () => {
  it('maps manager roles through the game master style', () => {
    expect(resolveCampaignViewerFacetLabel('owner', 'gm')).toBe('GM')
    expect(resolveCampaignViewerFacetLabel('co-owner', 'gm')).toBe('GM')
    expect(resolveCampaignViewerFacetLabel('owner', 'dm')).toBe('DM')
    expect(resolveCampaignViewerFacetLabel('co-owner', 'dm')).toBe('DM')
  })

  it('maps pc and observer from campaign role vocabulary', () => {
    expect(resolveCampaignViewerFacetLabel('pc', 'gm')).toBe('Player')
    expect(resolveCampaignViewerFacetLabel('pc', 'dm')).toBe('Player')
    expect(resolveCampaignViewerFacetLabel('observer', 'gm')).toBe('Observer')
    expect(resolveCampaignViewerFacetLabel('observer', 'dm')).toBe('Observer')
  })
})

describe('campaign display count formatters', () => {
  it('formats player member counts from role sentence forms', () => {
    expect(formatCampaignPlayerMemberCount(1)).toBe('1 player')
    expect(formatCampaignPlayerMemberCount(4)).toBe('4 players')
  })

  it('formats open PC counts with PC abbreviation', () => {
    expect(formatCampaignOpenPcCount(1)).toBe('1 PC')
    expect(formatCampaignOpenPcCount(6)).toBe('6 PCs')
  })
})

describe('resolveCampaignStatusLabel', () => {
  it('returns status entry labels', () => {
    expect(resolveCampaignStatusLabel('active')).toBe('Active')
    expect(resolveCampaignStatusLabel('draft')).toBe('Draft')
  })
})

describe('DEFAULT_GAME_MASTER_DISPLAY_STYLE', () => {
  it('defaults to gm', () => {
    expect(DEFAULT_GAME_MASTER_DISPLAY_STYLE).toBe('gm')
  })
})
