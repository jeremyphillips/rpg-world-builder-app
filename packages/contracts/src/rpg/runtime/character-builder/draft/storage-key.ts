import type { CharacterBuildContext } from '../context'
import {
  resolveCharacterBuilderDraftKey,
  resolveCharacterBuilderDraftScope,
  type CharacterBuilderDraftStorageRetainedDimensions,
} from './draft-storage'
import type { CharacterBuilderDraftScope } from './draft-scope'

// ---------------------------------------------------------------------------
// Context-aware sessionStorage keys — delegates to explicit draft scope helpers.
// ---------------------------------------------------------------------------

export const CHARACTER_BUILDER_STORAGE_KEY_PREFIX = 'character-builder'

export function resolveCharacterBuilderStorageKey(
  scope: CharacterBuilderDraftScope,
  retained: CharacterBuilderDraftStorageRetainedDimensions = {},
): string {
  return resolveCharacterBuilderDraftKey(scope, retained)
}

export function getCharacterBuilderStorageKey(
  context: Pick<CharacterBuildContext, 'mode' | 'characterKind' | 'rulesScope'>,
  userId?: string,
): string | null {
  const scope = resolveCharacterBuilderDraftScope(context, userId)
  if (!scope) return null
  return resolveCharacterBuilderDraftKey(scope, { mode: context.mode })
}
