import { describe, expect, it } from 'vitest'

import { getCharacterBuilderStorageKey } from './storage-key'

describe('getCharacterBuilderStorageKey', () => {
  it('keys standalone drafts by mode, user, ruleset, and character kind', () => {
    expect(
      getCharacterBuilderStorageKey(
        {
          mode: 'dashboard',
          characterKind: 'pc',
          rulesScope: { type: 'ruleset', rulesetId: 'srd-cc-5.2.1' },
        },
        'user_1',
      ),
    ).toBe('character-builder:standalone:dashboard:user_1:srd-cc-5.2.1:pc')
  })

  it('keys campaign drafts by campaign and character kind', () => {
    expect(
      getCharacterBuilderStorageKey({
        mode: 'dashboard',
        characterKind: 'npc',
        rulesScope: {
          type: 'campaign',
          campaignId: 'camp-1',
          rulesetId: 'srd-cc-5.2.1',
        },
      }),
    ).toBe('character-builder:campaign:camp-1:npc')
  })

  it('returns null for standalone drafts without a user id', () => {
    expect(
      getCharacterBuilderStorageKey({
        mode: 'dashboard',
        characterKind: 'pc',
        rulesScope: { type: 'ruleset', rulesetId: 'srd-cc-5.2.1' },
      }),
    ).toBeNull()
  })

  it('does not collide across modes, kinds, or scopes', () => {
    const keys = [
      getCharacterBuilderStorageKey(
        {
          mode: 'public',
          characterKind: 'pc',
          rulesScope: { type: 'ruleset', rulesetId: 'srd-cc-5.2.1' },
        },
        'user_1',
      ),
      getCharacterBuilderStorageKey(
        {
          mode: 'dashboard',
          characterKind: 'pc',
          rulesScope: { type: 'ruleset', rulesetId: 'srd-cc-5.2.1' },
        },
        'user_1',
      ),
      getCharacterBuilderStorageKey({
        mode: 'dashboard',
        characterKind: 'npc',
        rulesScope: {
          type: 'campaign',
          campaignId: 'camp-1',
          rulesetId: 'srd-cc-5.2.1',
        },
      }),
    ]

    expect(new Set(keys).size).toBe(keys.length)
  })
})
