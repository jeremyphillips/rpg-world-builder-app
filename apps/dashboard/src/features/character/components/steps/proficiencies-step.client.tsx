'use client'

import {
  type CharacterBuilderDraft,
  type CharacterBuildValidationIssue,
  type ChoiceSet,
} from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { ChoiceSetField } from '../choice-set-field.client'
import { withChoiceSetSelections } from '../../lib/choice-set-selections'
import { choiceSetsForProficienciesStep } from '../../lib/proficiencies-step.lib'
import { BuilderStepFrame } from './builder-step-frame.client'

export type ProficienciesStepProps = {
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

export function ProficienciesStep({
  draft,
  resolvedChoiceSets,
  validationIssues,
  onDraftChange,
}: ProficienciesStepProps) {
  const choiceSets = choiceSetsForProficienciesStep(resolvedChoiceSets)

  if (choiceSets.length === 0) {
    return (
      <BuilderStepFrame stepId="proficiencies" validationIssues={validationIssues}>
        <Text variant="muted">No proficiency choices are required for this character.</Text>
      </BuilderStepFrame>
    )
  }

  return (
    <BuilderStepFrame stepId="proficiencies" validationIssues={validationIssues}>
      <div className="space-y-6">
        {choiceSets.map((choiceSet) => (
          <ChoiceSetField
            key={choiceSet.id}
            choiceSet={choiceSet}
            value={draft.choiceSelections[choiceSet.id] ?? []}
            onValueChange={(selections) => {
              onDraftChange({
                choiceSelections: withChoiceSetSelections(draft, choiceSet.id, selections),
              })
            }}
          />
        ))}
      </div>
    </BuilderStepFrame>
  )
}
