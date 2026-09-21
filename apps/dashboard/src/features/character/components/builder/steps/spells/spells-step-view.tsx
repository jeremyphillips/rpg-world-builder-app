import {
  isBuilderStepBlockedNoClass,
  isBuilderStepReadinessMessageOnly,
  showsBuilderStepReviewMessage,
} from '../../../../lib/builder/builder-step-readiness.lib'
import {
  SPELLS_CHOOSE_CLASS_PROMPT_DESCRIPTION,
  SPELLS_CHOOSE_CLASS_PROMPT_HEADING,
} from '../../../../lib/spells/spells-step.lib'
import { SpellsStepInteractiveContent } from './spells-step-interactive-content'
import { SpellsStepPicker } from './spells-step-picker'
import { BuilderStepFrame } from '../shared/builder-step-frame'
import { BuilderStepChooseClassPrompt } from '../shared/builder-step-choose-class-prompt'
import { BuilderStepReadinessPanel } from '../shared/builder-step-readiness-panel'
import type { SpellsStepProps } from './spells-step'
import type { useSpellsStep } from '../../../../hooks/use-spells-step'

export function SpellsStepView({
  validationIssues,
  onNavigateToStep,
  onDraftChange,
  step,
}: Pick<SpellsStepProps, 'validationIssues' | 'onNavigateToStep' | 'onDraftChange'> & {
  step: ReturnType<typeof useSpellsStep>
}) {
  const {
    model,
    profile,
    readiness,
    activeChoiceSet,
    pickerInitialSpellLevel,
    activeSpellLevel,
    setActiveSpellLevel,
    openChoiceSet,
    closeChoiceSet,
    removeChoiceSelection,
    draft,
    context,
  } = step

  if (isBuilderStepBlockedNoClass(readiness, draft)) {
    return (
      <BuilderStepFrame stepId="spells" validationIssues={validationIssues}>
        <BuilderStepChooseClassPrompt
          heading={SPELLS_CHOOSE_CLASS_PROMPT_HEADING}
          description={SPELLS_CHOOSE_CLASS_PROMPT_DESCRIPTION}
          onNavigateToStep={onNavigateToStep}
        />
      </BuilderStepFrame>
    )
  }

  if (isBuilderStepReadinessMessageOnly(readiness)) {
    return (
      <BuilderStepFrame stepId="spells" validationIssues={validationIssues}>
        <BuilderStepReadinessPanel state={readiness} />
      </BuilderStepFrame>
    )
  }

  if (!model || !profile) return null

  return (
    <BuilderStepFrame stepId="spells" validationIssues={validationIssues}>
      <div className="space-y-8">
        {showsBuilderStepReviewMessage(readiness) ? (
          <BuilderStepReadinessPanel state={readiness} />
        ) : null}

        <SpellsStepInteractiveContent
          model={model}
          activeSpellLevel={activeSpellLevel}
          validationIssues={validationIssues}
          onActiveLevelChange={setActiveSpellLevel}
          onOpenChoiceSet={openChoiceSet}
          onRemoveChoice={removeChoiceSelection}
        />
      </div>

      {activeChoiceSet ? (
        <SpellsStepPicker
          className={profile.className}
          draft={draft}
          context={context}
          choiceSet={activeChoiceSet}
          initialSpellLevel={pickerInitialSpellLevel}
          onDraftChange={onDraftChange}
          onClose={closeChoiceSet}
        />
      ) : null}
    </BuilderStepFrame>
  )
}
