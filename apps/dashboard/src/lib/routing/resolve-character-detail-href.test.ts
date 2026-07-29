import { describe, expect, it } from 'vitest'

import { resolveCharacterDetailHref } from './resolve-character-detail-href'

describe('resolveCharacterDetailHref', () => {
  it('routes standalone scope to the personal detail path', () => {
    expect(resolveCharacterDetailHref({ scope: 'standalone', characterId: 'char-1' })).toBe(
      '/characters/char-1',
    )
  })

  it('routes campaign scope to the campaign character detail path', () => {
    expect(
      resolveCharacterDetailHref({
        scope: 'campaign',
        campaignId: 'camp-1',
        characterId: 'char-1',
      }),
    ).toBe('/campaigns/camp-1/characters/char-1')
  })

  it('routes list items with open campaign route context to the campaign path', () => {
    expect(
      resolveCharacterDetailHref({
        id: 'char-1',
        routeContext: {
          kind: 'campaign',
          openCampaign: { id: 'camp-1' },
          rosterStatus: 'active',
        },
      }),
    ).toBe('/campaigns/camp-1/characters/char-1')
  })

  it('routes list items without open campaign to the standalone path', () => {
    expect(
      resolveCharacterDetailHref({
        id: 'char-1',
        routeContext: { kind: 'standalone' },
      }),
    ).toBe('/characters/char-1')
  })
})
