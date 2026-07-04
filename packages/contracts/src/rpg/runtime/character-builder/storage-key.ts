import type { CharacterBuildContext } from './context'

// ---------------------------------------------------------------------------
// Context-aware sessionStorage keys so public/dashboard, standalone/campaign,
// and (later) import drafts never collide. Import-mode keys will append
// `:character:<characterId>` when that mode ships.
// ---------------------------------------------------------------------------

export const CHARACTER_BUILDER_STORAGE_KEY_PREFIX = 'character-builder'

export function getCharacterBuilderStorageKey(
  context: Pick<CharacterBuildContext, 'mode' | 'scope'>,
): string {
  const { mode, scope } = context
  return scope.type === 'standalone'
    ? `${CHARACTER_BUILDER_STORAGE_KEY_PREFIX}:${mode}:standalone:${scope.rulesetId}`
    : `${CHARACTER_BUILDER_STORAGE_KEY_PREFIX}:${mode}:campaign:${scope.campaignId}`
}
