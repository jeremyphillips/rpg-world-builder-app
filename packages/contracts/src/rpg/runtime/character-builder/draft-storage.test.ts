import { describe, expect, it, vi } from 'vitest'

import { createEmptyCharacterBuilderDraft, createPersistedCharacterBuilderState } from './draft'
import {
  loadCharacterBuilderDraftFromStorage,
  resolveCharacterBuilderDraftKey,
  resolveCharacterBuilderDraftScope,
} from './draft-storage'
import type { CharacterBuilderDraftScope } from './draft-scope'

const standaloneScope: CharacterBuilderDraftScope = {
  kind: 'standalone',
  userId: 'user_1',
  rulesetId: 'srd-cc-5.2.1',
  characterKind: 'pc',
}

const campaignScope: CharacterBuilderDraftScope = {
  kind: 'campaign',
  campaignId: 'camp_1',
  characterKind: 'pc',
}

describe('resolveCharacterBuilderDraftKey', () => {
  it('keys standalone drafts by mode, user, ruleset, and character kind', () => {
    expect(resolveCharacterBuilderDraftKey(standaloneScope, { mode: 'dashboard' })).toBe(
      'character-builder:standalone:dashboard:user_1:srd-cc-5.2.1:pc',
    )
  })

  it('keys campaign drafts by campaign and character kind', () => {
    expect(resolveCharacterBuilderDraftKey(campaignScope)).toBe(
      'character-builder:campaign:camp_1:pc',
    )
  })

  it('isolates drafts across scopes', () => {
    const keys = [
      resolveCharacterBuilderDraftKey(standaloneScope, { mode: 'dashboard' }),
      resolveCharacterBuilderDraftKey(standaloneScope, { mode: 'public' }),
      resolveCharacterBuilderDraftKey({
        ...standaloneScope,
        userId: 'user_2',
      }),
      resolveCharacterBuilderDraftKey(campaignScope),
      resolveCharacterBuilderDraftKey({ ...campaignScope, characterKind: 'npc' }),
    ]

    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('resolveCharacterBuilderDraftScope', () => {
  it('derives campaign scope from campaign build context', () => {
    expect(
      resolveCharacterBuilderDraftScope(
        {
          characterKind: 'npc',
          rulesScope: {
            type: 'campaign',
            campaignId: 'camp_1',
            rulesetId: 'srd-cc-5.2.1',
          },
        },
        undefined,
      ),
    ).toEqual({
      kind: 'campaign',
      campaignId: 'camp_1',
      characterKind: 'npc',
    })
  })

  it('requires user id for standalone scope', () => {
    expect(
      resolveCharacterBuilderDraftScope(
        {
          characterKind: 'pc',
          rulesScope: { type: 'ruleset', rulesetId: 'srd-cc-5.2.1' },
        },
        undefined,
      ),
    ).toBeNull()

    expect(
      resolveCharacterBuilderDraftScope(
        {
          characterKind: 'pc',
          rulesScope: { type: 'ruleset', rulesetId: 'srd-cc-5.2.1' },
        },
        'user_1',
      ),
    ).toEqual(standaloneScope)
  })
})

describe('loadCharacterBuilderDraftFromStorage', () => {
  it('restores a scoped draft when scope matches', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Verna' },
    }
    const persisted = createPersistedCharacterBuilderState(draft, standaloneScope)

    expect(loadCharacterBuilderDraftFromStorage(persisted, standaloneScope)).toEqual({
      status: 'restored',
      draft,
    })
  })

  it('rejects scope mismatches without clearing storage', () => {
    const draft = createEmptyCharacterBuilderDraft()
    const persisted = createPersistedCharacterBuilderState(draft, standaloneScope)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = loadCharacterBuilderDraftFromStorage(persisted, campaignScope)

    expect(result).toEqual({
      status: 'rejected',
      reason: 'scope_mismatch',
      shouldClear: false,
    })
    warnSpy.mockRestore()
  })

  it('rejects obsolete payloads and allows clearing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const legacy = {
      version: 3,
      draft: createEmptyCharacterBuilderDraft(),
    }

    expect(loadCharacterBuilderDraftFromStorage(legacy, standaloneScope)).toEqual({
      status: 'rejected',
      reason: 'version_mismatch',
      shouldClear: true,
    })

    warnSpy.mockRestore()
  })
})
