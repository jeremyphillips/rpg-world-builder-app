import type { CharacterKind } from '../../character-acquisition/kind'
import type { CharacterRulesScope } from '../../character-acquisition/scope'
import { proficiencyBonus } from '../../../primitives/level'
import { formatFieldMessage } from '../../../../validation/define-message'
import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import type { CharacterBuildContext, ResolvedCharacterCreationRules } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { validationIssue } from '../validate/issue'
import type { CharacterBuildValidationIssue } from '../validate/types'

import {
  isClassProgressionApplicable,
  isLevelZeroNpcPermitted,
  resolveCharacterLevelConstraints,
} from './character-level-policy'

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

export function resolveBuilderMaxAllowedLevel(
  rules: Pick<ResolvedCharacterCreationRules, 'progression'>,
): number {
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

/** @deprecated Use {@link resolveCharacterLevelConstraints} — kept for existing imports. */
export function resolveBuilderLevelConstraints(
  context: CharacterBuildContext,
): BuilderLevelConstraints {
  return resolveCharacterLevelConstraints({
    characterKind: context.characterKind,
    rulesScope: context.rulesScope,
    characterCreationRules: context.characterCreationRules,
  })
}

export type ValidateBuilderCharacterLevelInput = {
  level: number
  characterKind: CharacterKind
  rulesScope: CharacterRulesScope
  characterCreationRules: ResolvedCharacterCreationRules
}

const LEVEL_FIELD = { path: 'class.level', stepId: 'class' as const }

function levelZeroNotPermittedIssue(): CharacterBuildValidationIssue {
  return validationIssue(
    'level_zero_not_permitted',
    formatFieldMessage(characterBuilderValidationMessages.levelZeroNotPermitted()),
    LEVEL_FIELD,
  )
}

function validateLevelZeroIssues(
  input: ValidateBuilderCharacterLevelInput,
): CharacterBuildValidationIssue[] {
  if (input.level !== 0) return []

  const pcAtLevelZero = input.characterKind === 'pc'
  const npcWithoutFeature =
    input.characterKind === 'npc' && !input.characterCreationRules.levelZeroNpcs.enabled

  return pcAtLevelZero || npcWithoutFeature ? [levelZeroNotPermittedIssue()] : []
}

export function validateBuilderCharacterLevel(
  input: ValidateBuilderCharacterLevelInput,
): CharacterBuildValidationIssue[] {
  const issues: CharacterBuildValidationIssue[] = []
  const maxLevel = resolveBuilderMaxAllowedLevel(input.characterCreationRules)
  const { minLevel } = resolveCharacterLevelConstraints({
    characterKind: input.characterKind,
    rulesScope: input.rulesScope,
    characterCreationRules: input.characterCreationRules,
  })
  const isCampaignPc = input.characterKind === 'pc' && input.rulesScope.type === 'campaign'

  if (input.level < minLevel) {
    issues.push(
      validationIssue(
        'level_below_allowed_minimum',
        formatFieldMessage(characterBuilderValidationMessages.levelBelowAllowedMinimum()),
        LEVEL_FIELD,
      ),
    )
  }

  issues.push(...validateLevelZeroIssues(input))

  if (input.level > maxLevel) {
    issues.push(
      validationIssue(
        'level_exceeds_campaign_maximum',
        formatFieldMessage(
          characterBuilderValidationMessages.levelExceedsCampaignMaximum({ maxLevel }),
        ),
        LEVEL_FIELD,
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
        LEVEL_FIELD,
      ),
    )
  }

  return issues
}

export function resolveBuilderProficiencyBonus(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
): number | undefined {
  if (draft.class.level === 0 && isLevelZeroNpcPermitted(context)) {
    return context.characterCreationRules.levelZeroNpcs.proficiencyBonus
  }

  if (!isClassProgressionApplicable(draft.class.level)) {
    return undefined
  }

  return proficiencyBonus(draft.class.level)
}
