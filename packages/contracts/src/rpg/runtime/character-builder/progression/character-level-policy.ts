import type { CharacterKind } from '../../character-acquisition/kind'
import type { CharacterRulesScope } from '../../character-acquisition/scope'
import { allowsLevelZeroForKind, locksCampaignStartingLevel } from '../character-kind-policy'
import type { CharacterBuildContext, ResolvedCharacterCreationRules } from '../context'
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
  return allowsLevelZeroForKind(
    context.characterKind,
    context.characterCreationRules.levelZeroNpcs.enabled,
  )
}

/** Builder draft is a classless Level 0 NPC under permitted campaign rules. */
export function isBuilderLevelZeroClassless(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
): boolean {
  return draft.class.level === 0 && isLevelZeroNpcPermitted(context)
}

export type CharacterLevelPolicyInput = {
  characterKind: CharacterKind
  rulesScope: CharacterRulesScope
  characterCreationRules: Pick<
    ResolvedCharacterCreationRules,
    'startingLevel' | 'levelZeroNpcs' | 'progression'
  >
}

export function resolveCharacterLevelConstraints(
  input: CharacterLevelPolicyInput,
): BuilderLevelConstraints {
  const maxLevel = resolveBuilderMaxAllowedLevel(input.characterCreationRules)
  const lockStartingLevel = locksCampaignStartingLevel(input.characterKind, input.rulesScope.type)

  if (lockStartingLevel) {
    const fixedLevel = input.characterCreationRules.startingLevel
    return {
      mode: 'fixed',
      fixedLevel,
      minLevel: fixedLevel,
      maxLevel: fixedLevel,
      allowedLevels: [fixedLevel],
    }
  }

  const minLevel = allowsLevelZeroForKind(
    input.characterKind,
    input.characterCreationRules.levelZeroNpcs.enabled,
  )
    ? 0
    : 1

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
