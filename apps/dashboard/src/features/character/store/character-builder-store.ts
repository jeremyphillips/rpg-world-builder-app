import {
  createEmptyCharacterBuilderDraft,
  createPersistedCharacterBuilderState,
  loadCharacterBuilderDraftFromStorage,
  normalizeCharacterBuilderDraft,
  type CharacterBuilderDraft,
  type CharacterBuilderDraftScope,
  type PersistedCharacterBuilderState,
} from '@rpg/contracts'
import { create } from 'zustand'
import { createJSONStorage, persist, type PersistStorage } from 'zustand/middleware'

import { isNonEmptyCharacterBuilderDraft } from '../lib/is-non-empty-character-builder-draft'
import { mergeCharacterBuilderDraft } from '../lib/merge-character-builder-draft'

export type CharacterBuilderStoreState = {
  draft: CharacterBuilderDraft
  hasPendingRestore: boolean
  pendingRestoredDraft: CharacterBuilderDraft | null
  _hasHydrated: boolean
  setDraft: (draft: CharacterBuilderDraft) => void
  patchDraft: (patch: Partial<CharacterBuilderDraft>) => void
  continuePreviousDraft: () => void
  startOver: () => void
  clearPersistedDraft: () => Promise<void>
  setHasHydrated: (value: boolean) => void
}

export type CharacterBuilderStore = ReturnType<typeof createCharacterBuilderStoreImpl>

type CharacterBuilderStoreConfig = {
  storageKey: string
  scope: CharacterBuilderDraftScope
}

export function createCharacterBuilderStore({ storageKey, scope }: CharacterBuilderStoreConfig) {
  return createCharacterBuilderStoreImpl(storageKey, scope)
}

function createSuppressiblePersistStorage(): PersistStorage<PersistedCharacterBuilderState> & {
  suppressNextWrite: () => void
} {
  let suppressWrite = false
  const base = createJSONStorage<PersistedCharacterBuilderState>(() => sessionStorage)!

  return {
    getItem: (name) => base.getItem(name),
    setItem: (name, value) => {
      if (suppressWrite) {
        suppressWrite = false
        return
      }
      base.setItem(name, value)
    },
    removeItem: (name) => base.removeItem(name),
    suppressNextWrite: () => {
      suppressWrite = true
    },
  }
}

function readPersistedPayloadFromRehydratedState(
  rehydratedState: CharacterBuilderStoreState,
  scope: CharacterBuilderDraftScope,
): unknown {
  const candidate = rehydratedState as CharacterBuilderStoreState &
    Partial<PersistedCharacterBuilderState>

  if (
    typeof candidate.version === 'number' &&
    candidate.scope &&
    typeof candidate.updatedAt === 'string'
  ) {
    return {
      version: candidate.version,
      scope: candidate.scope,
      updatedAt: candidate.updatedAt,
      draft: candidate.draft,
    }
  }

  return createPersistedCharacterBuilderState(candidate.draft, scope)
}

function finishCharacterBuilderHydration(
  store: CharacterBuilderStore,
  scope: CharacterBuilderDraftScope,
  storageKey: string,
  hasCompletedInitialHydration: { completed: boolean },
  rehydratedState?: CharacterBuilderStoreState,
): void {
  if (hasCompletedInitialHydration.completed) return
  hasCompletedInitialHydration.completed = true

  if (rehydratedState) {
    const rawStorage = sessionStorage.getItem(storageKey)
    const persistedPayload = rawStorage
      ? (JSON.parse(rawStorage) as { state?: unknown }).state
      : readPersistedPayloadFromRehydratedState(rehydratedState, scope)
    const loadResult = loadCharacterBuilderDraftFromStorage(persistedPayload, scope)

    if (loadResult.status === 'rejected' && loadResult.shouldClear) {
      void store.persist.clearStorage()
    }

    if (loadResult.status !== 'restored') {
      store.setState({
        draft: createEmptyCharacterBuilderDraft(),
        hasPendingRestore: false,
        pendingRestoredDraft: null,
        _hasHydrated: true,
      })
      return
    }

    const mergedDraft = normalizeCharacterBuilderDraft(loadResult.draft)
    if (isNonEmptyCharacterBuilderDraft(mergedDraft)) {
      store.setState({
        draft: createEmptyCharacterBuilderDraft(),
        pendingRestoredDraft: mergedDraft,
        hasPendingRestore: true,
        _hasHydrated: true,
      })
      return
    }

    if (mergedDraft !== loadResult.draft) {
      store.setState({ draft: mergedDraft, _hasHydrated: true })
      return
    }

    store.setState({ _hasHydrated: true })
    return
  }

  store.setState({ _hasHydrated: true })
}

function createCharacterBuilderStoreImpl(storageKey: string, scope: CharacterBuilderDraftScope) {
  const storage = createSuppressiblePersistStorage()
  const hydrationState = { completed: false }

  const store = create<CharacterBuilderStoreState>()(
    persist(
      (set, get) => ({
        draft: createEmptyCharacterBuilderDraft(),
        hasPendingRestore: false,
        pendingRestoredDraft: null,
        _hasHydrated: false,
        setDraft: (draft) => set({ draft }),
        patchDraft: (patch) =>
          set((state) => ({ draft: mergeCharacterBuilderDraft(state.draft, patch) })),
        continuePreviousDraft: () => {
          const restored = get().pendingRestoredDraft
          if (!restored) return
          set({
            draft: restored,
            hasPendingRestore: false,
            pendingRestoredDraft: null,
          })
        },
        startOver: () => {
          storage.suppressNextWrite()
          void store.persist.clearStorage()
          set({
            draft: createEmptyCharacterBuilderDraft(),
            hasPendingRestore: false,
            pendingRestoredDraft: null,
          })
        },
        clearPersistedDraft: async () => {
          storage.suppressNextWrite()
          await store.persist.clearStorage()
        },
        setHasHydrated: (value) => set({ _hasHydrated: value }),
      }),
      {
        name: storageKey,
        storage,
        partialize: (state): PersistedCharacterBuilderState =>
          createPersistedCharacterBuilderState(state.draft, scope),
        onRehydrateStorage: () => (state, error) => {
          queueMicrotask(() => {
            if (error || !state) {
              finishCharacterBuilderHydration(store, scope, storageKey, hydrationState)
              return
            }
            finishCharacterBuilderHydration(store, scope, storageKey, hydrationState, state)
          })
        },
      },
    ),
  )

  store.persist.onFinishHydration((state) => {
    if (!store.getState()._hasHydrated) {
      finishCharacterBuilderHydration(store, scope, storageKey, hydrationState, state)
    }
  })

  return store
}

const storeCache = new Map<string, CharacterBuilderStore>()

export function getCharacterBuilderStore(
  storageKey: string,
  scope: CharacterBuilderDraftScope,
): CharacterBuilderStore {
  let store = storeCache.get(storageKey)
  if (!store) {
    store = createCharacterBuilderStore({ storageKey, scope })
    storeCache.set(storageKey, store)
  }
  return store
}

export function resetCharacterBuilderStoreCache(): void {
  storeCache.clear()
}
