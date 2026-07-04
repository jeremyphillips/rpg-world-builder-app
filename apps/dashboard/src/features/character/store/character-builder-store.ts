import {
  characterBuilderDraftSchema,
  createEmptyCharacterBuilderDraft,
  createPersistedCharacterBuilderState,
  type CharacterBuilderDraft,
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

export function createCharacterBuilderStore(storageKey: string) {
  return createCharacterBuilderStoreImpl(storageKey)
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

function finishCharacterBuilderHydration(
  store: CharacterBuilderStore,
  rehydratedState?: CharacterBuilderStoreState,
): void {
  if (rehydratedState) {
    const parsed = characterBuilderDraftSchema.safeParse(rehydratedState.draft)
    if (!parsed.success) {
      store.setState({
        draft: createEmptyCharacterBuilderDraft(),
        hasPendingRestore: false,
        pendingRestoredDraft: null,
        _hasHydrated: true,
      })
      return
    }

    const mergedDraft = parsed.data
    if (isNonEmptyCharacterBuilderDraft(mergedDraft)) {
      store.setState({
        draft: createEmptyCharacterBuilderDraft(),
        pendingRestoredDraft: mergedDraft,
        hasPendingRestore: true,
        _hasHydrated: true,
      })
      return
    }

    store.setState({ _hasHydrated: true })
    return
  }

  store.setState({ _hasHydrated: true })
}

function createCharacterBuilderStoreImpl(storageKey: string) {
  const storage = createSuppressiblePersistStorage()

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
          createPersistedCharacterBuilderState(state.draft),
        onRehydrateStorage: () => (state, error) => {
          queueMicrotask(() => {
            if (error || !state) {
              finishCharacterBuilderHydration(store)
              return
            }
            finishCharacterBuilderHydration(store, state)
          })
        },
      },
    ),
  )

  store.persist.onFinishHydration((state) => {
    if (!state._hasHydrated) {
      finishCharacterBuilderHydration(store, state)
    }
  })

  if (store.persist.hasHydrated() && !store.getState()._hasHydrated) {
    finishCharacterBuilderHydration(store, store.getState())
  }

  return store
}

const storeCache = new Map<string, CharacterBuilderStore>()

export function getCharacterBuilderStore(storageKey: string): CharacterBuilderStore {
  let store = storeCache.get(storageKey)
  if (!store) {
    store = createCharacterBuilderStore(storageKey)
    storeCache.set(storageKey, store)
  }
  return store
}

export function resetCharacterBuilderStoreCache(): void {
  storeCache.clear()
}
