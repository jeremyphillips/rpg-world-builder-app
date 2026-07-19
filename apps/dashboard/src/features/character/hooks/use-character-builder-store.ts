import { useStore } from 'zustand'

import type { CharacterBuildContext } from '@rpg/contracts'
import { getCharacterBuilderStorageKey } from '@rpg/contracts'

import {
  getCharacterBuilderStore,
  type CharacterBuilderStoreState,
} from '../store/character-builder-store'

type CharacterBuilderContextSlice = Pick<
  CharacterBuildContext,
  'mode' | 'scope' | 'characterKind' | 'rulesScope'
> | null

export function useCharacterBuilderStore<T>(
  context: CharacterBuilderContextSlice,
  selector: (state: CharacterBuilderStoreState) => T,
): T {
  const storageKey = context ? getCharacterBuilderStorageKey(context) : null
  const store = storageKey ? getCharacterBuilderStore(storageKey) : null

  return useStore(store ?? getDisabledCharacterBuilderStore(), selector)
}

const disabledStore = getCharacterBuilderStore('character-builder:disabled')

function getDisabledCharacterBuilderStore() {
  return disabledStore
}

export function useCharacterBuilderStorageKey(
  context: CharacterBuilderContextSlice,
): string | null {
  return context ? getCharacterBuilderStorageKey(context) : null
}
