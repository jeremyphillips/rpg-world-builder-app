'use client'

import { Text } from '@rpg/ui'

import { PROFICIENCIES_STEP_EMPTY_MESSAGE } from '../../lib/proficiencies-step.lib'
import { ProficiencyPickerDrawer } from '../proficiencies/proficiency-picker-drawer.client'
import { ProficiencySection } from '../proficiencies/proficiency-section.client'
import { BuilderStepFrame } from './builder-step-frame.client'
import type { ProficienciesStepProps } from './proficiencies-step.types'
import type { useProficienciesStep } from './use-proficiencies-step.client'

export function ProficienciesStepView({
  validationIssues,
  step,
}: Pick<ProficienciesStepProps, 'validationIssues'> & {
  step: ReturnType<typeof useProficienciesStep>
}) {
  const {
    model,
    activeChoiceSet,
    pickerItems,
    draft,
    openChoiceSet,
    closeChoiceSet,
    addChoiceSelection,
    removeChoiceSelection,
  } = step

  if (model.sections.length === 0) {
    return (
      <BuilderStepFrame stepId="proficiencies" validationIssues={validationIssues}>
        <Text variant="muted">{PROFICIENCIES_STEP_EMPTY_MESSAGE}</Text>
      </BuilderStepFrame>
    )
  }

  return (
    <BuilderStepFrame stepId="proficiencies" validationIssues={validationIssues}>
      <div className="space-y-8">
        {model.sections.map((section) => (
          <ProficiencySection
            key={section.kind}
            section={section}
            onOpenChoiceSet={openChoiceSet}
            onRemoveChoice={removeChoiceSelection}
          />
        ))}
      </div>

      {activeChoiceSet ? (
        <ProficiencyPickerDrawer
          open
          onOpenChange={(open) => {
            if (!open) closeChoiceSet()
          }}
          choiceSet={activeChoiceSet}
          selectedIds={draft.choiceSelections[activeChoiceSet.id] ?? []}
          items={pickerItems}
          onSelectOption={(optionId) => addChoiceSelection(activeChoiceSet.id, optionId)}
          onRemoveOption={(optionId) => removeChoiceSelection(activeChoiceSet.id, optionId)}
        />
      ) : null}
    </BuilderStepFrame>
  )
}
