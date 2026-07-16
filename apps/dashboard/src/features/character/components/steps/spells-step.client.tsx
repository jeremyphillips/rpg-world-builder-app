'use client'

import { useMemo, useState } from 'react'

import {
  resolveBuilderStepReadiness,
  resolveSpellcastingProfile,
  resolveSpellPickerItems,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuildPreview,
  type CharacterBuildValidationIssue,
  type ChoiceSet,
} from '@rpg/contracts'

import {
  isBuilderStepReadinessMessageOnly,
  showsBuilderStepReviewMessage,
} from '../../lib/builder-step-readiness.lib'
import { choiceSetsForSpellsStep } from '../../lib/spells-step.lib'
import { withChoiceSetSelections } from '../../lib/choice-set-selections'
import { BuilderStepFrame } from './builder-step-frame.client'
import { BuilderStepReadinessPanel } from './builder-step-readiness-panel.client'
import { SpellChoiceSection } from '../spells/spell-choice-section.client'
import { SpellPickerDrawer } from '../spells/spell-picker-drawer.client'
import { SpellcastingSummaryCard } from '../spells/spellcasting-summary-card.client'
import {
  SPELL_PICKER_MODE_CANTRIPS,
  SPELL_PICKER_MODE_PREPARED_SPELLS,
  type SpellPickerMode,
} from '../spells/spell-picker-drawer.types'

export type SpellsStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  preview: CharacterBuildPreview | null
  resolvedChoiceSets: readonly ChoiceSet[]
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

function spellPickerModeForChoiceSet(choiceSet: ChoiceSet): SpellPickerMode {
  return choiceSet.choiceType === 'cantrip'
    ? SPELL_PICKER_MODE_CANTRIPS
    : SPELL_PICKER_MODE_PREPARED_SPELLS
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

  const cantripItems = useMemo(() => {
    if (!cantripChoiceSet) return []
    return resolveSpellPickerItems({
      draft,
      context,
      choiceSetId: cantripChoiceSet.id,
    })
  }, [cantripChoiceSet, context, draft])

  const preparedItems = useMemo(() => {
    if (!preparedChoiceSet) return []
    return resolveSpellPickerItems({
      draft,
      context,
      choiceSetId: preparedChoiceSet.id,
    })
  }, [context, draft, preparedChoiceSet])

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

      {pickerOpen && profile ? (
        <SpellPickerDrawer
          open
          onOpenChange={(open) => {
            if (!open) setPickerOpen(false)
          }}
          className={profile.className}
          cantripChoiceSet={cantripChoiceSet}
          preparedChoiceSet={preparedChoiceSet}
          cantripSelectedIds={draft.choiceSelections[cantripChoiceSet?.id ?? ''] ?? []}
          preparedSelectedIds={draft.choiceSelections[preparedChoiceSet?.id ?? ''] ?? []}
          cantripItems={cantripItems}
          preparedItems={preparedItems}
          initialMode={initialPickerMode}
          onSelectSpell={(mode, spellId) => {
            const choiceSet =
              mode === SPELL_PICKER_MODE_CANTRIPS ? cantripChoiceSet : preparedChoiceSet
            if (!choiceSet) return
            const current = draft.choiceSelections[choiceSet.id] ?? []
            if (current.includes(spellId)) return
            onDraftChange({
              choiceSelections: withChoiceSetSelections(draft, choiceSet.id, [...current, spellId]),
            })
          }}
          onRemoveSpell={(mode, spellId) => {
            const choiceSet =
              mode === SPELL_PICKER_MODE_CANTRIPS ? cantripChoiceSet : preparedChoiceSet
            if (!choiceSet) return
            const current = draft.choiceSelections[choiceSet.id] ?? []
            onDraftChange({
              choiceSelections: withChoiceSetSelections(
                draft,
                choiceSet.id,
                current.filter((id) => id !== spellId),
              ),
            })
          }}
        />
      ) : null}
    </BuilderStepFrame>
  )
}
