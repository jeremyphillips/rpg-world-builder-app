import type { CharacterBuildValidationIssue } from '../../../character-builder/validation-issue'

export type { CharacterBuildValidationIssue }

export const CHARACTER_BUILD_VALIDATION_PHASES = ['draft', 'stepSubmit', 'finalSubmit'] as const

export type CharacterBuildValidationPhase = (typeof CHARACTER_BUILD_VALIDATION_PHASES)[number]

export type CharacterBuildValidationResult = {
  ok: boolean
  issues: CharacterBuildValidationIssue[]
}
