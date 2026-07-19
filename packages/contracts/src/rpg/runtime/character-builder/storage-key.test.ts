import { describe, expect, it } from 'vitest'

import { getCharacterBuilderStorageKey } from './storage-key'

describe('getCharacterBuilderStorageKey', () => {
  it('keys standalone drafts by mode and ruleset', () => {
    expect(
      getCharacterBuilderStorageKey({
        mode: 'dashboard',
        characterKind: 'pc',
        rulesScope: { type: 'ruleset', rulesetId: 'srd-cc-5.2.1' },
        scope: { type: 'standalone', rulesetId: 'srd-cc-5.2.1' },
      }),
    ).toBe('character-builder:dashboard:standalone:srd-cc-5.2.1')
  })

  it('keys campaign drafts by character kind and campaign', () => {
    expect(
      getCharacterBuilderStorageKey({
        mode: 'dashboard',
        characterKind: 'npc',
        rulesScope: {
          type: 'campaign',
          campaignId: 'camp-1',
          rulesetId: 'srd-cc-5.2.1',
        },
        scope: { type: 'campaign', campaignId: 'camp-1', rulesetId: 'srd-cc-5.2.1' },
      }),
    ).toBe('character-builder:npc:campaign:camp-1')
  })

  it('does not collide across modes, kinds, or scopes', () => {
    const keys = [
      getCharacterBuilderStorageKey({
        mode: 'public',
        characterKind: 'pc',
        rulesScope: { type: 'ruleset', rulesetId: 'srd-cc-5.2.1' },
        scope: { type: 'standalone', rulesetId: 'srd-cc-5.2.1' },
      }),
      getCharacterBuilderStorageKey({
        mode: 'dashboard',
        characterKind: 'pc',
        rulesScope: { type: 'ruleset', rulesetId: 'srd-cc-5.2.1' },
        scope: { type: 'standalone', rulesetId: 'srd-cc-5.2.1' },
      }),
      getCharacterBuilderStorageKey({
        mode: 'dashboard',
        characterKind: 'npc',
        rulesScope: {
          type: 'campaign',
          campaignId: 'camp-1',
          rulesetId: 'srd-cc-5.2.1',
        },
        scope: { type: 'campaign', campaignId: 'camp-1', rulesetId: 'srd-cc-5.2.1' },
      }),
    ]
    expect(new Set(keys).size).toBe(keys.length)
  })
})
