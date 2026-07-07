import { ABILITY_IDS, ABILITY_SCORE_MIN, CHARACTER_ABILITY_SCORE_MAX } from '../../../vocab/ability'
import { abilityValidationMessages } from '../../../vocab/ability-messages'
import { isStandardArrayAssignment } from '../ability-generation'
import { characterBuilderValidationMessages } from '../character-builder-messages'
import type { CharacterBuilderDraft } from '../draft'

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

export function validateSpecies(draft: CharacterBuilderDraft): CharacterBuildValidationIssue[] {
  if (draft.species.speciesId) return []

  return [
    validationIssue('species_required', characterBuilderValidationMessages.speciesRequired(), {
      path: 'species.speciesId',
      stepId: 'species',
    }),
  ]
}

export function validateClass(draft: CharacterBuilderDraft): CharacterBuildValidationIssue[] {
  if (draft.class.classId) return []

  return [
    validationIssue('class_required', characterBuilderValidationMessages.classRequired(), {
      path: 'class.classId',
      stepId: 'class',
    }),
  ]
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
