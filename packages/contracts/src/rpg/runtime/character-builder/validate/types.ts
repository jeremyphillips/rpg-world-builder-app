import type { CharacterBuilderStepId } from '../step-ids'

export const CHARACTER_BUILD_VALIDATION_PHASES = ['draft', 'stepSubmit', 'finalSubmit'] as const

export type CharacterBuildValidationPhase = (typeof CHARACTER_BUILD_VALIDATION_PHASES)[number]

export type CharacterBuildValidationIssue = {
  code: string
  message: string
  path?: string
  stepId?: CharacterBuilderStepId
  choiceSetId?: string
}

export type CharacterBuildValidationResult = {
  ok: boolean
  issues: CharacterBuildValidationIssue[]
}
