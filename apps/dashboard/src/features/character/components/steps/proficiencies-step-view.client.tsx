'use client'

import {
  isBuilderStepReadinessMessageOnly,
  showsBuilderStepReviewMessage,
  visibleProficiencySections,
} from '../../lib/builder/builder-step-readiness.lib'
import { ProficiencyPickerDrawer } from '../proficiencies/proficiency-picker-drawer.client'
import { ProficiencySection } from '../proficiencies/proficiency-section.client'
import { BuilderStepFrame } from './builder-step-frame.client'
import { BuilderStepReadinessPanel } from './builder-step-readiness-panel.client'
import type { ProficienciesStepProps } from './proficiencies-step.types'
import type { useProficienciesStep } from '../../hooks/use-proficiencies-step.client'

export function ProficienciesStepView({
  validationIssues,
  step,
}: Pick<ProficienciesStepProps, 'validationIssues'> & {
  step: ReturnType<typeof useProficienciesStep>
}) {
  const {
    model,
    readiness,
    activeChoiceSet,
    pickerItems,
    catalogIndex,
    draft,
    openChoiceSet,
    closeChoiceSet,
    addChoiceSelection,
    removeChoiceSelection,
  } = step

  const visibleSections = visibleProficiencySections(
    model.sections,
    readiness.classDependentBlocked,
  )

  if (isBuilderStepReadinessMessageOnly(readiness)) {
    return (
      <BuilderStepFrame stepId="proficiencies" validationIssues={validationIssues}>
        <BuilderStepReadinessPanel state={readiness} />
      </BuilderStepFrame>
    )
  }

  return (
    <BuilderStepFrame stepId="proficiencies" validationIssues={validationIssues}>
      <div className="space-y-8">
        {readiness.classDependentBlocked || showsBuilderStepReviewMessage(readiness) ? (
          <BuilderStepReadinessPanel state={readiness} />
        ) : null}

        {visibleSections.map((section) => (
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
          catalogIndex={catalogIndex}
          onSelectOption={(optionId) => addChoiceSelection(activeChoiceSet.id, optionId)}
          onRemoveOption={(optionId) => removeChoiceSelection(activeChoiceSet.id, optionId)}
        />
      ) : null}
    </BuilderStepFrame>
  )
}
