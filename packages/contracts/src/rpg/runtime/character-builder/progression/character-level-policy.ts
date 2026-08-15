import type { CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'

import { resolveBuilderMaxAllowedLevel, type BuilderLevelConstraints } from './builder-level'

// ---------------------------------------------------------------------------
// Character level policy — surface-agnostic constraints and class progression.
// Authoring surfaces choose their own defaults from resolveCharacterLevelConstraints.
// ---------------------------------------------------------------------------

/** Class progression applies at level 1 and above — domain invariant. */
export function isClassProgressionApplicable(level: number): boolean {
  return level >= 1
}

/** Campaign permits creating Level 0 NPCs. */
export function isLevelZeroNpcPermitted(context: CharacterBuildContext): boolean {
  return context.characterKind === 'npc' && context.characterCreationRules.levelZeroNpcs.enabled
}

/** Builder draft is a classless Level 0 NPC under permitted campaign rules. */
export function isBuilderLevelZeroClassless(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
): boolean {
  return draft.class.level === 0 && isLevelZeroNpcPermitted(context)
}

export function resolveCharacterLevelConstraints(
  context: CharacterBuildContext,
): BuilderLevelConstraints {
  const maxLevel = resolveBuilderMaxAllowedLevel(context.characterCreationRules)
  const isCampaignPc = context.characterKind === 'pc' && context.rulesScope.type === 'campaign'

  if (isCampaignPc) {
    const fixedLevel = context.characterCreationRules.startingLevel
    return {
      mode: 'fixed',
      fixedLevel,
      minLevel: fixedLevel,
      maxLevel: fixedLevel,
      allowedLevels: [fixedLevel],
    }
  }

  const minLevel = context.characterKind === 'npc' && isLevelZeroNpcPermitted(context) ? 0 : 1

  return {
    mode: 'selectable',
    minLevel,
    maxLevel,
  }
}

/** Effective draft for validation/finalize — strips class when progression does not apply. */
export function sanitizeClassForLevel(draft: CharacterBuilderDraft): CharacterBuilderDraft {
  if (isClassProgressionApplicable(draft.class.level)) {
    return draft
  }

  return {
    ...draft,
    class: {
      level: draft.class.level,
      classId: undefined,
    },
  }
}
