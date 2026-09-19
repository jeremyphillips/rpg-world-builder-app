import {
  isBuilderStepReadinessMessageOnly,
  resolveVisibleProficiencyStepContent,
  showsBuilderStepReviewMessage,
} from '../../../../lib/builder/builder-step-readiness.lib'
import {
  PROFICIENCIES_CHOOSE_CLASS_PROMPT_DESCRIPTION,
  PROFICIENCIES_CHOOSE_CLASS_PROMPT_HEADING,
} from '../../../../lib/proficiencies/proficiencies-step.lib'
import { ProficiencyPickerDrawer } from '../../../proficiencies/picker/proficiency-picker-drawer'
import { ProficiencyGrantedSummary } from './proficiency-granted-summary'
import { ProficiencySection } from './proficiency-section'
import { BuilderStepFrame } from '../shared/builder-step-frame'
import { BuilderStepChooseClassPrompt } from '../shared/builder-step-choose-class-prompt'
import { BuilderStepReadinessPanel } from '../shared/builder-step-readiness-panel'
import type { ProficienciesStepProps } from './proficiencies-step.types'
import type { useProficienciesStep } from '../../../../hooks/use-proficiencies-step'

export function ProficienciesStepView({
  draft,
  validationIssues,
  onNavigateToStep,
  step,
}: Pick<ProficienciesStepProps, 'draft' | 'validationIssues' | 'onNavigateToStep'> & {
  step: ReturnType<typeof useProficienciesStep>
}) {
  const {
    model,
    readiness,
    activeChoiceSet,
    pickerItems,
    catalogIndex,
    openChoiceSet,
    closeChoiceSet,
    addChoiceSelection,
    removeChoiceSelection,
  } = step

  const showsChooseClassPrompt = readiness.classDependentBlocked === true && !draft.class.classId

  const { sections: visibleSections, fixedGrants: visibleFixedGrants } =
    resolveVisibleProficiencyStepContent(model, readiness.classDependentBlocked)

  const chooseClassPrompt = showsChooseClassPrompt ? (
    <BuilderStepChooseClassPrompt
      heading={PROFICIENCIES_CHOOSE_CLASS_PROMPT_HEADING}
      description={PROFICIENCIES_CHOOSE_CLASS_PROMPT_DESCRIPTION}
      onNavigateToStep={onNavigateToStep}
    />
  ) : null

  if (showsChooseClassPrompt && visibleSections.length === 0 && visibleFixedGrants.length === 0) {
    return (
      <BuilderStepFrame stepId="proficiencies" validationIssues={validationIssues}>
        {chooseClassPrompt}
      </BuilderStepFrame>
    )
  }

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
        {chooseClassPrompt}
        {showsBuilderStepReviewMessage(readiness) ? (
          <BuilderStepReadinessPanel state={readiness} />
        ) : null}

        {visibleFixedGrants.length > 0 ? (
          <ProficiencyGrantedSummary rows={visibleFixedGrants} />
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
