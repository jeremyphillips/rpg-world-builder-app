'use client'

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
  isBuilderStepReadinessMessageOnly,
  showsBuilderStepReviewMessage,
} from '../../lib/builder-step-readiness.lib'
import { choiceSetsForSpellsStep } from '../../lib/spells-step.lib'
import { withChoiceSetSelections } from '../../lib/choice-set-selections'
import { BuilderStepFrame } from './builder-step-frame.client'
import { BuilderStepReadinessPanel } from './builder-step-readiness-panel.client'
import { SpellChoiceSection } from '../spells/spell-choice-section.client'
import { SpellcastingSummaryCard } from '../spells/spellcasting-summary-card.client'
import {
  SPELL_PICKER_MODE_CANTRIPS,
  type SpellPickerMode,
} from '../spells/spell-picker-drawer.types'
import { spellPickerModeForChoiceSet, SpellsStepPicker } from './spells-step-picker.client'

export type SpellsStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  preview: CharacterBuildPreview | null
  resolvedChoiceSets: readonly ChoiceSet[]
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

export function SpellsStep({
  context,
  draft,
  preview,
  resolvedChoiceSets,
  validationIssues,
  onDraftChange,
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
  const [pickerOpen, setPickerOpen] = useState(false)
  const [initialPickerMode, setInitialPickerMode] = useState<SpellPickerMode>(
    SPELL_PICKER_MODE_CANTRIPS,
  )

  const cantripChoiceSet = choiceSets.find((choiceSet) => choiceSet.choiceType === 'cantrip')
  const preparedChoiceSet = choiceSets.find((choiceSet) => choiceSet.choiceType === 'spell')

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
                setInitialPickerMode(spellPickerModeForChoiceSet(choiceSet))
                setPickerOpen(true)
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

      {pickerOpen ? (
        <SpellsStepPicker
          className={profile.className}
          draft={draft}
          context={context}
          cantripChoiceSet={cantripChoiceSet}
          preparedChoiceSet={preparedChoiceSet}
          initialMode={initialPickerMode}
          onDraftChange={onDraftChange}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </BuilderStepFrame>
  )
}
