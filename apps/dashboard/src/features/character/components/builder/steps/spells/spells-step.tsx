import { useMemo, useState } from 'react'

import {
  resolveBuilderStepReadiness,
  resolveSpellcastingProfile,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuildPreview,
  type ChoiceSet,
} from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'

import {
  isBuilderStepBlockedNoClass,
  isBuilderStepReadinessMessageOnly,
  showsBuilderStepReviewMessage,
} from '../../../../lib/builder/builder-step-readiness.lib'
import type { CharacterBuilderNavigateToStep } from '../../../../lib/builder/character-builder-navigation-options'
import {
  choiceSetsForSpellsStep,
  SPELLS_CHOOSE_CLASS_PROMPT_DESCRIPTION,
  SPELLS_CHOOSE_CLASS_PROMPT_HEADING,
} from '../../../../lib/spells/spells-step.lib'
import { withChoiceSetSelections } from '../../../../lib/choice-sets/choice-set-selections'
import { BuilderStepFrame } from '../shared/builder-step-frame'
import { BuilderStepChooseClassPrompt } from '../shared/builder-step-choose-class-prompt'
import { BuilderStepReadinessPanel } from '../shared/builder-step-readiness-panel'
import { SpellChoiceSection } from './spell-choice-section'
import { SpellcastingSummaryCard } from './spellcasting-summary-card'
import { SpellsStepPicker } from './spells-step-picker'

export type SpellsStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  preview: CharacterBuildPreview | null
  resolvedChoiceSets: readonly ChoiceSet[]
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
  onNavigateToStep: CharacterBuilderNavigateToStep
}

export function SpellsStep({
  context,
  draft,
  preview,
  resolvedChoiceSets,
  validationIssues,
  onDraftChange,
  onNavigateToStep,
}: SpellsStepProps) {
  const readiness = useMemo(
    () => resolveBuilderStepReadiness('spells', draft, context, resolvedChoiceSets),
    [context, draft, resolvedChoiceSets],
  )
  const profile = useMemo(() => resolveSpellcastingProfile(draft, context), [context, draft])
  const choiceSets = useMemo(
    () => choiceSetsForSpellsStep(resolvedChoiceSets),
    [resolvedChoiceSets],
  )
  const [pickerChoiceSet, setPickerChoiceSet] = useState<ChoiceSet | null>(null)

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

  if (!profile) return null

  return (
    <BuilderStepFrame stepId="spells" validationIssues={validationIssues}>
      <div className="space-y-6">
        {showsBuilderStepReviewMessage(readiness) ? (
          <BuilderStepReadinessPanel state={readiness} />
        ) : null}

        <SpellcastingSummaryCard profile={profile} preview={preview} />

        {choiceSets.map((choiceSet) => {
          const selectedIds = draft.choiceSelections[choiceSet.id] ?? []

          return (
            <SpellChoiceSection
              key={choiceSet.id}
              choiceSet={choiceSet}
              selectedIds={selectedIds}
              onAdd={() => {
                setPickerChoiceSet(choiceSet)
              }}
              onRemove={(spellId) => {
                onDraftChange({
                  choiceSelections: withChoiceSetSelections(
                    draft,
                    choiceSet.id,
                    selectedIds.filter((id) => id !== spellId),
                  ),
                })
              }}
            />
          )
        })}
      </div>

      {pickerChoiceSet ? (
        <SpellsStepPicker
          className={profile.className}
          draft={draft}
          context={context}
          choiceSet={pickerChoiceSet}
          onDraftChange={onDraftChange}
          onClose={() => setPickerChoiceSet(null)}
        />
      ) : null}
    </BuilderStepFrame>
  )
}
