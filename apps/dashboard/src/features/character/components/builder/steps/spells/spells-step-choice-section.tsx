import type { BuilderChoiceSectionModel } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'

import {
  SPELLS_STEP_OVER_SELECTION_MESSAGE,
  validationIssuesForSpellChoiceSet,
  validationIssuesForSpellSection,
} from '../../../../lib/spells/spells-step.lib'
import { ChoiceSection } from '../shared/choice-section/choice-section'

type SpellsStepChoiceSectionProps = {
  section: BuilderChoiceSectionModel
  validationIssues: readonly CharacterBuildValidationIssue[]
  onOpenChoiceSet: (choiceSetId: string) => void
  onRemoveChoice: (choiceSetId: string, optionId: string) => void
}

export function SpellsStepChoiceSection({
  section,
  validationIssues,
  onOpenChoiceSet,
  onRemoveChoice,
}: SpellsStepChoiceSectionProps) {
  return (
    <ChoiceSection
      section={section}
      sectionIdPrefix="spells-section"
      overSelectionMessage={SPELLS_STEP_OVER_SELECTION_MESSAGE}
      validationIssues={validationIssues}
      validationIssuesForChoiceSet={validationIssuesForSpellChoiceSet}
      validationIssuesForSection={validationIssuesForSpellSection}
      onOpenChoiceSet={onOpenChoiceSet}
      onRemoveChoice={onRemoveChoice}
    />
  )
}
