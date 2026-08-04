import { useMemo } from 'react'
import { useStore } from 'zustand'

import type { CharacterBuildContext } from '@rpg/contracts'
import {
  resolveCharacterBuilderDraftKey,
  resolveCharacterBuilderDraftScope,
  type CharacterBuilderDraftScope,
} from '@rpg/contracts'

import { useSession } from '@/features/auth'

import {
  getCharacterBuilderStore,
  type CharacterBuilderStoreState,
} from '../store/character-builder-store'

type CharacterBuilderContextSlice = Pick<
  CharacterBuildContext,
  'mode' | 'characterKind' | 'rulesScope'
> | null

function useCharacterBuilderDraftScope(
  context: CharacterBuilderContextSlice,
): CharacterBuilderDraftScope | null {
  const { data: session } = useSession()

  return useMemo(
    () => (context ? resolveCharacterBuilderDraftScope(context, session?.user.id) : null),
    [context?.characterKind, context?.mode, context?.rulesScope, session?.user.id],
  )
}

export function useCharacterBuilderStore<T>(
  context: CharacterBuilderContextSlice,
  selector: (state: CharacterBuilderStoreState) => T,
): T {
  const scope = useCharacterBuilderDraftScope(context)
  const storageKey = scope ? resolveCharacterBuilderDraftKey(scope, { mode: context?.mode }) : null
  const store = storageKey && scope ? getCharacterBuilderStore(storageKey, scope) : null

  return useStore(store ?? getDisabledCharacterBuilderStore(), selector)
}

const disabledStore = getCharacterBuilderStore('character-builder:disabled', {
  kind: 'standalone',
  userId: 'disabled',
  rulesetId: 'srd-cc-5.2.1',
  characterKind: 'pc',
})

function getDisabledCharacterBuilderStore() {
  return disabledStore
}

export function useCharacterBuilderStorageKey(
  context: CharacterBuilderContextSlice,
): string | null {
  const scope = useCharacterBuilderDraftScope(context)
  return scope ? resolveCharacterBuilderDraftKey(scope, { mode: context?.mode }) : null
}

export function useCharacterBuilderDraftScopeFromContext(
  context: CharacterBuilderContextSlice,
): CharacterBuilderDraftScope | null {
  return useCharacterBuilderDraftScope(context)
}
