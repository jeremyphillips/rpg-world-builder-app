import { ABILITY_IDS, ABILITY_SCORE_MIN, CHARACTER_ABILITY_SCORE_MAX } from '../../../vocab/ability'
import { abilityValidationMessages } from '../../../vocab/ability-messages'
import { isStandardArrayAssignment } from '../ability/ability-generation'
import { isClassProgressionApplicable } from '../progression/character-level-policy'
import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import { validateBuilderCharacterLevel } from '../progression/builder-level'
import { indexPlayableBuilderCatalog } from '../preview/index-playable-builder-catalog'
import type { CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'

import { validationIssue } from './issue'
import type { CharacterBuildValidationIssue } from './types'

export function validateIdentity(
  draft: CharacterBuilderDraft,
  requireAlignment: boolean,
): CharacterBuildValidationIssue[] {
  const issues: CharacterBuildValidationIssue[] = []

  if (!draft.identity.name?.trim()) {
    issues.push(
      validationIssue('name_required', characterBuilderValidationMessages.nameRequired(), {
        path: 'identity.name',
        stepId: 'identity',
      }),
    )
  }

  if (requireAlignment && !draft.identity.alignment) {
    issues.push(
      validationIssue(
        'alignment_required',
        characterBuilderValidationMessages.alignmentRequired(),
        {
          path: 'identity.alignment',
          stepId: 'identity',
        },
      ),
    )
  }

  return issues
}

export function validateSpecies(
  draft: CharacterBuilderDraft,
  context?: CharacterBuildContext,
): CharacterBuildValidationIssue[] {
  const issues: CharacterBuildValidationIssue[] = []

  if (!draft.species.speciesId) {
    issues.push(
      validationIssue('species_required', characterBuilderValidationMessages.speciesRequired(), {
        path: 'species.speciesId',
        stepId: 'species',
      }),
    )
    return issues
  }

  if (context && !indexPlayableBuilderCatalog(context).species.has(draft.species.speciesId)) {
    issues.push(
      validationIssue(
        'species_not_in_catalog',
        characterBuilderValidationMessages.speciesNotInCatalog(),
        { path: 'species.speciesId', stepId: 'species' },
      ),
    )
  }

  return issues
}

export function validateClass(
  draft: CharacterBuilderDraft,
  context?: CharacterBuildContext,
): CharacterBuildValidationIssue[] {
  const issues: CharacterBuildValidationIssue[] = []

  if (!isClassProgressionApplicable(draft.class.level) && draft.class.classId) {
    issues.push(
      validationIssue(
        'class_not_permitted_at_level_zero',
        characterBuilderValidationMessages.classNotPermittedAtLevelZero(),
        { path: 'class.classId', stepId: 'class' },
      ),
    )
  }

  if (isClassProgressionApplicable(draft.class.level) && !draft.class.classId) {
    issues.push(
      validationIssue('class_required', characterBuilderValidationMessages.classRequired(), {
        path: 'class.classId',
        stepId: 'class',
      }),
    )
  }

  if (
    context &&
    isClassProgressionApplicable(draft.class.level) &&
    draft.class.classId &&
    !indexPlayableBuilderCatalog(context).classes.has(draft.class.classId)
  ) {
    issues.push(
      validationIssue(
        'class_not_in_catalog',
        characterBuilderValidationMessages.classNotInCatalog(),
        { path: 'class.classId', stepId: 'class' },
      ),
    )
  }

  if (context) {
    issues.push(
      ...validateBuilderCharacterLevel({
        level: draft.class.level,
        characterKind: context.characterKind,
        rulesScope: context.rulesScope,
        characterCreationRules: context.characterCreationRules,
      }),
    )
  }

  return issues
}

export function validateAbilities(
  draft: CharacterBuilderDraft,
  standardArray: readonly number[],
): CharacterBuildValidationIssue[] {
  const issues: CharacterBuildValidationIssue[] = []

  if (!draft.abilities.method) {
    issues.push(
      validationIssue(
        'ability_method_required',
        characterBuilderValidationMessages.abilityMethodRequired(),
        {
          path: 'abilities.method',
          stepId: 'abilities',
        },
      ),
    )
    return issues
  }

  const scores = draft.abilities.scores
  if (!scores || !ABILITY_IDS.every((ability) => typeof scores[ability] === 'number')) {
    issues.push(
      validationIssue(
        'abilities_incomplete',
        characterBuilderValidationMessages.abilitiesIncomplete(),
        {
          path: 'abilities.scores',
          stepId: 'abilities',
        },
      ),
    )
    return issues
  }

  for (const ability of ABILITY_IDS) {
    const score = scores[ability]!
    if (score < ABILITY_SCORE_MIN || score > CHARACTER_ABILITY_SCORE_MAX) {
      issues.push(
        validationIssue(
          'ability_score_out_of_range',
          abilityValidationMessages.characterScoreOutOfRange({
            min: ABILITY_SCORE_MIN,
            max: CHARACTER_ABILITY_SCORE_MAX,
          }),
          { path: `abilities.scores.${ability}`, stepId: 'abilities' },
        ),
      )
    }
  }

  if (
    draft.abilities.method === 'standard-array' &&
    !isStandardArrayAssignment(scores, standardArray)
  ) {
    issues.push(
      validationIssue(
        'standard_array_exact_assignment',
        characterBuilderValidationMessages.standardArrayExactAssignment(),
        { path: 'abilities.scores', stepId: 'abilities' },
      ),
    )
  }

  return issues
}
