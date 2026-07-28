import type { CharacterBuilderDraft } from '@rpg/contracts'

const NAVIGATION_ONLY_PATCH_KEYS = new Set<keyof CharacterBuilderDraft>([
  'currentStepId',
  'touchedStepIds',
])

/** True when a draft patch changes builder content (not navigation metadata). */
export function patchTouchesDraftContent(patch: Partial<CharacterBuilderDraft>): boolean {
  return Object.keys(patch).some(
    (key) => !NAVIGATION_ONLY_PATCH_KEYS.has(key as keyof CharacterBuilderDraft),
  )
}
