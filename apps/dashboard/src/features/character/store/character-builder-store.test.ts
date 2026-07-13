import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createEmptyCharacterBuilderDraft,
  createPersistedCharacterBuilderState,
} from '@rpg/contracts'

import {
  createCharacterBuilderStore,
  resetCharacterBuilderStoreCache,
} from './character-builder-store'

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
    const store = createCharacterBuilderStore('character-builder:test:standalone:ruleset-hydrate')

    await vi.waitFor(() => {
      expect(store.getState()._hasHydrated).toBe(true)
    })
  })

  it('persists only the version-wrapped draft', async () => {
    const store = createCharacterBuilderStore('character-builder:test:standalone:ruleset-a')
    store.getState().patchDraft({
      identity: { name: 'Verna' },
    })

    await vi.waitFor(() => {
      expect(sessionStorage.getItem('character-builder:test:standalone:ruleset-a')).toBeTruthy()
    })

    const raw = sessionStorage.getItem('character-builder:test:standalone:ruleset-a')
    const parsed = JSON.parse(raw!) as { state: unknown }
    const persisted = parsed.state as ReturnType<typeof createPersistedCharacterBuilderState>
    expect(persisted.version).toBe(2)
    expect(persisted.draft.identity.name).toBe('Verna')
    expect(persisted).not.toHaveProperty('catalog')
    expect(persisted).not.toHaveProperty('context')
  })

  it('drops corrupt persisted state without throwing', async () => {
    sessionStorage.setItem(
      'character-builder:test:standalone:ruleset-b',
      JSON.stringify({ state: { version: 99, draft: {} }, version: 0 }),
    )

    const store = createCharacterBuilderStore('character-builder:test:standalone:ruleset-b')

    await vi.waitFor(() => {
      expect(store.getState()._hasHydrated).toBe(true)
    })

    expect(store.getState().draft).toEqual(createEmptyCharacterBuilderDraft())
    expect(store.getState().hasPendingRestore).toBe(false)
  })

  it('rehydrates identity progress without alignment', async () => {
    const persistedDraft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Verna', narrative: { personalityTraits: ['Steady'] } },
      touchedStepIds: ['identity' as const],
    }
    sessionStorage.setItem(
      'character-builder:test:standalone:ruleset-rehydrate-identity',
      JSON.stringify({
        state: createPersistedCharacterBuilderState(persistedDraft),
        version: 0,
      }),
    )

    const store = createCharacterBuilderStore(
      'character-builder:test:standalone:ruleset-rehydrate-identity',
    )

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
      'character-builder:test:standalone:ruleset-c',
      JSON.stringify({
        state: createPersistedCharacterBuilderState(persistedDraft),
        version: 0,
      }),
    )

    const store = createCharacterBuilderStore('character-builder:test:standalone:ruleset-c')

    await vi.waitFor(() => {
      expect(store.getState()._hasHydrated).toBe(true)
    })

    expect(store.getState().hasPendingRestore).toBe(true)
    expect(store.getState().pendingRestoredDraft).toEqual(persistedDraft)
    expect(store.getState().draft).toEqual(createEmptyCharacterBuilderDraft())
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
      'character-builder:test:standalone:ruleset-legacy-purchases',
      JSON.stringify({
        state: createPersistedCharacterBuilderState(persistedDraft),
        version: 0,
      }),
    )

    const store = createCharacterBuilderStore(
      'character-builder:test:standalone:ruleset-legacy-purchases',
    )

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
    const store = createCharacterBuilderStore('character-builder:test:standalone:ruleset-d')
    store.setState({
      hasPendingRestore: true,
      pendingRestoredDraft: persistedDraft,
    })

    store.getState().continuePreviousDraft()
    expect(store.getState().draft.identity.name).toBe('Verna')
    expect(store.getState().hasPendingRestore).toBe(false)

    store.getState().startOver()
    expect(store.getState().draft).toEqual(createEmptyCharacterBuilderDraft())
    expect(sessionStorage.getItem('character-builder:test:standalone:ruleset-d')).toBeNull()
  })
})
