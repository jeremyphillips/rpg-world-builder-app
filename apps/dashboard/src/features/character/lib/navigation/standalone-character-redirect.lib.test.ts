import { describe, expect, it } from 'vitest'

import {
  buildStandaloneCharacterRedirectSearch,
  resolveStandaloneCharacterRedirectTarget,
} from './standalone-character-redirect.lib'

describe('buildStandaloneCharacterRedirectSearch', () => {
  it('drops unrecognized query params', () => {
    const search = buildStandaloneCharacterRedirectSearch(
      new URLSearchParams('unknown=1&other=two'),
    )
    expect(search).toBe('')
  })
})

describe('resolveStandaloneCharacterRedirectTarget', () => {
  it('returns a campaign detail href when the viewer belongs to the open campaign', () => {
    expect(
      resolveStandaloneCharacterRedirectTarget({
        characterId: 'char-1',
        routingContext: { openCampaign: { id: 'camp-1' } },
        campaigns: [{ id: 'camp-1' }],
        search: '',
      }),
    ).toBe('/campaigns/camp-1/characters/char-1')
  })

  it('returns null when the viewer is not a member of the open campaign', () => {
    expect(
      resolveStandaloneCharacterRedirectTarget({
        characterId: 'char-1',
        routingContext: { openCampaign: { id: 'camp-1' } },
        campaigns: [{ id: 'camp-2' }],
        search: '',
      }),
    ).toBeNull()
  })

  it('returns null when there is no open campaign', () => {
    expect(
      resolveStandaloneCharacterRedirectTarget({
        characterId: 'char-1',
        routingContext: {},
        campaigns: [{ id: 'camp-1' }],
        search: '',
      }),
    ).toBeNull()
  })
})
