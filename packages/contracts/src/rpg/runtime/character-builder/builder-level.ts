import type { CharacterKind } from '../character-acquisition/kind'
import type { CharacterRulesScope } from '../character-acquisition/scope'
import { formatFieldMessage } from '../../../validation/define-message'
import { characterBuilderValidationMessages } from './character-builder-messages'
import type { CharacterBuildContext, ResolvedCharacterCreationRules } from './context'
import type { CharacterBuilderDraft } from './draft'
import { validationIssue } from './validate/issue'
import type { CharacterBuildValidationIssue } from './validate/types'

// ---------------------------------------------------------------------------
// Builder level — total vs selected starting level semantics.
// ---------------------------------------------------------------------------

/**
 * Total character level for proficiency bonus, cantrip scaling, and similar
 * total-level mechanics. Today equals the single class level; owns the future
 * multiclass sum transition.
 */
export function getCharacterBuilderTotalLevel(draft: CharacterBuilderDraft): number {
  return draft.class.level
}

/**
 * Selected starting level for wealth tiers and equipment economics in the
 * single-class builder. Not a universal total-level mechanic — future inputs
 * may include campaign entry level or NPC design policy.
 */
export function getBuilderSelectedStartingLevel(draft: CharacterBuilderDraft): number {
  return draft.class.level
}

export function resolveBuilderMaxAllowedLevel(rules: ResolvedCharacterCreationRules): number {
  const { progression } = rules
  return progression.extendedProgression?.maxLevel ?? progression.maxCharacterLevel
}

export type BuilderLevelConstraints = {
  mode: 'fixed' | 'selectable'
  fixedLevel?: number
  minLevel: number
  maxLevel: number
  allowedLevels?: number[]
}

export function resolveBuilderLevelConstraints(
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

  return {
    mode: 'selectable',
    minLevel: 1,
    maxLevel,
  }
}

export type ValidateBuilderCharacterLevelInput = {
  level: number
  characterKind: CharacterKind
  rulesScope: CharacterRulesScope
  characterCreationRules: ResolvedCharacterCreationRules
}

export function validateBuilderCharacterLevel(
  input: ValidateBuilderCharacterLevelInput,
): CharacterBuildValidationIssue[] {
  const issues: CharacterBuildValidationIssue[] = []
  const maxLevel = resolveBuilderMaxAllowedLevel(input.characterCreationRules)
  const isCampaignPc = input.characterKind === 'pc' && input.rulesScope.type === 'campaign'

  if (input.level < 1) {
    issues.push(
      validationIssue(
        'level_below_allowed_minimum',
        formatFieldMessage(characterBuilderValidationMessages.levelBelowAllowedMinimum()),
        { path: 'class.level', stepId: 'class' },
      ),
    )
  }

  if (input.level > maxLevel) {
    issues.push(
      validationIssue(
        'level_exceeds_campaign_maximum',
        formatFieldMessage(
          characterBuilderValidationMessages.levelExceedsCampaignMaximum({ maxLevel }),
        ),
        { path: 'class.level', stepId: 'class' },
      ),
    )
  }

  if (isCampaignPc && input.level !== input.characterCreationRules.startingLevel) {
    issues.push(
      validationIssue(
        'level_must_match_starting_level',
        formatFieldMessage(
          characterBuilderValidationMessages.levelMustMatchStartingLevel({
            startingLevel: input.characterCreationRules.startingLevel,
          }),
        ),
        { path: 'class.level', stepId: 'class' },
      ),
    )
  }

  return issues
}
