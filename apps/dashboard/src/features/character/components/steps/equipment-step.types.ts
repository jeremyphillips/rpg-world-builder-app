import type {
  CharacterBuildContext,
  CharacterBuilderDraft,
  CharacterBuildValidationIssue,
  ChoiceSet,
} from '@rpg/contracts'

export type EquipmentStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}
