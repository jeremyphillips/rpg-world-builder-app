import type { CharacterBuildContext } from './context'

// ---------------------------------------------------------------------------
// Context-aware sessionStorage keys so public/dashboard, standalone/campaign,
// PC/NPC, and (later) import drafts never collide. Import-mode keys will
// append `:character:<characterId>` when that mode ships.
// ---------------------------------------------------------------------------

export const CHARACTER_BUILDER_STORAGE_KEY_PREFIX = 'character-builder'

export function getCharacterBuilderStorageKey(
  context: Pick<CharacterBuildContext, 'mode' | 'scope' | 'characterKind' | 'rulesScope'>,
): string {
  if (context.rulesScope.type === 'campaign') {
    return `${CHARACTER_BUILDER_STORAGE_KEY_PREFIX}:${context.characterKind}:campaign:${context.rulesScope.campaignId}`
  }

  const { mode } = context
  return `${CHARACTER_BUILDER_STORAGE_KEY_PREFIX}:${mode}:standalone:${context.rulesScope.rulesetId}`
}
