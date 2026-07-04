import { describe, expect, it } from 'vitest'

import { getCharacterBuilderStorageKey } from './storage-key'

describe('getCharacterBuilderStorageKey', () => {
  it('keys standalone drafts by mode and ruleset', () => {
    expect(
      getCharacterBuilderStorageKey({
        mode: 'dashboard',
        scope: { type: 'standalone', rulesetId: 'srd-cc-5.2.1' },
      }),
    ).toBe('character-builder:dashboard:standalone:srd-cc-5.2.1')
  })

  it('keys campaign drafts by mode and campaign', () => {
    expect(
      getCharacterBuilderStorageKey({
        mode: 'dashboard',
        scope: { type: 'campaign', campaignId: 'camp-1', rulesetId: 'srd-cc-5.2.1' },
      }),
    ).toBe('character-builder:dashboard:campaign:camp-1')
  })

  it('does not collide across modes or scopes', () => {
    const keys = [
      getCharacterBuilderStorageKey({
        mode: 'public',
        scope: { type: 'standalone', rulesetId: 'srd-cc-5.2.1' },
      }),
      getCharacterBuilderStorageKey({
        mode: 'dashboard',
        scope: { type: 'standalone', rulesetId: 'srd-cc-5.2.1' },
      }),
      getCharacterBuilderStorageKey({
        mode: 'dashboard',
        scope: { type: 'campaign', campaignId: 'camp-1', rulesetId: 'srd-cc-5.2.1' },
      }),
    ]
    expect(new Set(keys).size).toBe(keys.length)
  })
})
