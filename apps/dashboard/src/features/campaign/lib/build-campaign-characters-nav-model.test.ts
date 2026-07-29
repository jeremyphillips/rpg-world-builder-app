import { describe, expect, it } from 'vitest'

import { buildCampaignCharactersNavModel } from './build-campaign-characters-nav-model'

describe('buildCampaignCharactersNavModel', () => {
  it('hides Characters nav for observers', () => {
    expect(buildCampaignCharactersNavModel({ role: 'observer', controlledCount: 0 })).toEqual({
      showCharactersNav: false,
      sidebarLabel: 'Characters',
      pageTitle: 'Characters',
      listScope: 'controlled',
    })
  })

  it('uses Characters label and all-participating scope for managers', () => {
    expect(buildCampaignCharactersNavModel({ role: 'owner', controlledCount: 0 })).toEqual({
      showCharactersNav: true,
      sidebarLabel: 'Characters',
      pageTitle: 'Characters',
      listScope: 'all_participating',
    })
  })

  it('uses singular My character label when a PC controls one character', () => {
    expect(buildCampaignCharactersNavModel({ role: 'pc', controlledCount: 1 })).toEqual({
      showCharactersNav: true,
      sidebarLabel: 'My character',
      pageTitle: 'My character',
      listScope: 'controlled',
    })
  })

  it('uses plural My characters label when a PC controls multiple characters', () => {
    expect(buildCampaignCharactersNavModel({ role: 'pc', controlledCount: 2 })).toEqual({
      showCharactersNav: true,
      sidebarLabel: 'My characters',
      pageTitle: 'My characters',
      listScope: 'controlled',
    })
  })
})
