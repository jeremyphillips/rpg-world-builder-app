import { useSpellsStep } from '../../../../hooks/use-spells-step'
import type { CharacterBuilderNavigateToStep } from '../../../../lib/builder/character-builder-navigation-options'
import type {
  CharacterBuildContext,
  CharacterBuilderDraft,
  CharacterBuildPreview,
  ChoiceSet,
} from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { SpellsStepView } from './spells-step-view'

export type SpellsStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  preview: CharacterBuildPreview | null
  resolvedChoiceSets: readonly ChoiceSet[]
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
  onNavigateToStep: CharacterBuilderNavigateToStep
}

export function SpellsStep(props: SpellsStepProps) {
  const step = useSpellsStep(props)

  return (
    <SpellsStepView
      validationIssues={props.validationIssues}
      onNavigateToStep={props.onNavigateToStep}
      onDraftChange={props.onDraftChange}
      step={step}
    />
  )
}
