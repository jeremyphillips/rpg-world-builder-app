import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  CHARACTER_BUILDER_DRAFT_VERSION,
  createEmptyCharacterBuilderDraft,
  createPersistedCharacterBuilderState,
  type CharacterBuilderDraftScope,
} from '@rpg/contracts'

import {
  createCharacterBuilderStore,
  resetCharacterBuilderStoreCache,
} from './character-builder-store'

const standaloneScope: CharacterBuilderDraftScope = {
  kind: 'standalone',
  userId: 'user-test',
  rulesetId: 'srd-cc-5.2.1',
  characterKind: 'pc',
}

const storageKey = 'character-builder:standalone:dashboard:user-test:srd-cc-5.2.1:pc'

function installSessionStorageMock(): void {
  const storage = new Map<string, string>()
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
    removeItem: (key: string) => {
      storage.delete(key)
    },
    clear: () => {
      storage.clear()
    },
  })
}

describe('character-builder-store', () => {
  beforeEach(() => {
    installSessionStorageMock()
    sessionStorage.clear()
    resetCharacterBuilderStoreCache()
  })

  it('marks the store hydrated after automatic rehydration', async () => {
    const store = createCharacterBuilderStore({ storageKey, scope: standaloneScope })

    await vi.waitFor(() => {
      expect(store.getState()._hasHydrated).toBe(true)
    })
  })

  it('persists scoped draft metadata with the draft values', async () => {
    const store = createCharacterBuilderStore({ storageKey, scope: standaloneScope })

    await vi.waitFor(() => {
      expect(store.getState()._hasHydrated).toBe(true)
    })

    store.getState().patchDraft({
      identity: { name: 'Verna' },
    })

    await vi.waitFor(() => {
      const raw = sessionStorage.getItem(storageKey)
      expect(raw).toBeTruthy()
      const parsed = JSON.parse(raw!) as {
        state: ReturnType<typeof createPersistedCharacterBuilderState>
      }
      expect(parsed.state.draft.identity.name).toBe('Verna')
    })

    const raw = sessionStorage.getItem(storageKey)
    const parsed = JSON.parse(raw!) as {
      state: ReturnType<typeof createPersistedCharacterBuilderState>
    }
    const persisted = parsed.state as ReturnType<typeof createPersistedCharacterBuilderState>
    expect(persisted.version).toBe(CHARACTER_BUILDER_DRAFT_VERSION)
    expect(persisted.scope).toEqual(standaloneScope)
    expect(persisted.draft.identity.name).toBe('Verna')
    expect(persisted).not.toHaveProperty('catalog')
    expect(persisted).not.toHaveProperty('context')
  })

  it('drops corrupt persisted state without throwing', async () => {
    sessionStorage.setItem(storageKey, '{not-json')

    const store = createCharacterBuilderStore({ storageKey, scope: standaloneScope })

    await vi.waitFor(() => {
      expect(store.getState()._hasHydrated).toBe(true)
    })

    expect(store.getState().draft).toEqual(createEmptyCharacterBuilderDraft())
    expect(store.getState().hasPendingRestore).toBe(false)
    expect(store.getState().rejectedDraftRestoreReason).toBe('malformed')
  })

  it('surfaces a rejection reason when persisted draft restore fails', async () => {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({ state: { version: 99, draft: {} }, version: 0 }),
    )

    const store = createCharacterBuilderStore({ storageKey, scope: standaloneScope })

    await vi.waitFor(() => {
      expect(store.getState()._hasHydrated).toBe(true)
    })

    expect(store.getState().rejectedDraftRestoreReason).toBe('version_mismatch')
  })

  it('rehydrates identity progress without alignment', async () => {
    const persistedDraft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Verna', narrative: { personalityTraits: ['Steady'] } },
      touchedStepIds: ['identity' as const],
    }
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        state: createPersistedCharacterBuilderState(persistedDraft, standaloneScope),
        version: 0,
      }),
    )

    const store = createCharacterBuilderStore({ storageKey, scope: standaloneScope })

    await vi.waitFor(() => {
      expect(store.getState()._hasHydrated).toBe(true)
    })

    expect(store.getState().hasPendingRestore).toBe(true)
    expect(store.getState().pendingRestoredDraft?.identity).toEqual({
      name: 'Verna',
      narrative: { personalityTraits: ['Steady'] },
    })
  })

  it('surfaces a restore prompt for a non-empty prior draft', async () => {
    const persistedDraft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Verna', alignment: 'ng' as const },
      touchedStepIds: ['identity' as const],
    }
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        state: createPersistedCharacterBuilderState(persistedDraft, standaloneScope),
        version: 0,
      }),
    )

    const store = createCharacterBuilderStore({ storageKey, scope: standaloneScope })

    await vi.waitFor(() => {
      expect(store.getState()._hasHydrated).toBe(true)
    })

    expect(store.getState().hasPendingRestore).toBe(true)
    expect(store.getState().pendingRestoredDraft).toEqual(persistedDraft)
    expect(store.getState().draft).toEqual(createEmptyCharacterBuilderDraft())
  })

  it('rejects drafts with mismatched scope without clearing storage', async () => {
    const persistedDraft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Verna' },
    }
    const mismatchedScope: CharacterBuilderDraftScope = {
      kind: 'campaign',
      campaignId: 'camp_1',
      characterKind: 'pc',
    }
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        state: createPersistedCharacterBuilderState(persistedDraft, mismatchedScope),
        version: 0,
      }),
    )

    const store = createCharacterBuilderStore({ storageKey, scope: standaloneScope })

    await vi.waitFor(() => {
      expect(store.getState()._hasHydrated).toBe(true)
    })

    expect(store.getState().hasPendingRestore).toBe(false)
    expect(sessionStorage.getItem(storageKey)).toBeTruthy()
  })

  it('rehydrates legacy equipment purchases with stable ids', async () => {
    const classId = 'srd-cc-5.2.1:fighter'
    const persistedDraft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId, level: 1 as const },
      equipment: {
        mode: 'gold' as const,
        purchases: [
          {
            equipmentId: 'srd-cc-5.2.1:rations',
            quantity: 2,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        removedPackageItemKeys: [],
        customized: false,
      },
      touchedStepIds: ['equipment' as const],
    }
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        state: createPersistedCharacterBuilderState(persistedDraft, standaloneScope),
        version: 0,
      }),
    )

    const store = createCharacterBuilderStore({ storageKey, scope: standaloneScope })

    await vi.waitFor(() => {
      expect(store.getState()._hasHydrated).toBe(true)
    })

    expect(store.getState().pendingRestoredDraft?.equipment?.purchases[0]).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^legacy-purchase:/),
        origin: 'picker',
      }),
    )
  })

  it('continues or clears a pending restore', async () => {
    const persistedDraft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Verna' },
    }
    const store = createCharacterBuilderStore({ storageKey, scope: standaloneScope })
    store.setState({
      hasPendingRestore: true,
      pendingRestoredDraft: persistedDraft,
    })

    store.getState().continuePreviousDraft()
    expect(store.getState().draft.identity.name).toBe('Verna')
    expect(store.getState().hasPendingRestore).toBe(false)

    store.getState().startOver()
    expect(store.getState().draft).toEqual(createEmptyCharacterBuilderDraft())
    expect(sessionStorage.getItem(storageKey)).toBeNull()
  })
})
