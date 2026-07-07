import type {
  CharacterBuildContext,
  CharacterBuilderDraft,
  CharacterBuildPreview,
  CharacterBuildValidationIssue,
  ChoiceSet,
} from '@rpg/contracts'

export type ProficienciesStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  preview: CharacterBuildPreview | null
  resolvedChoiceSets: readonly ChoiceSet[]
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}
