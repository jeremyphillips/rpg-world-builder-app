'use client'

import { useMemo, useState } from 'react'

import {
  resolveSpellcastingProfile,
  resolveSpellPickerItems,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuildPreview,
  type CharacterBuildValidationIssue,
  type ChoiceSet,
} from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { choiceSetsForSpellsStep, SPELLS_STEP_NON_CASTER_MESSAGE } from '../../lib/spells-step.lib'
import { withChoiceSetSelections } from '../../lib/choice-set-selections'
import { BuilderStepFrame } from './builder-step-frame.client'
import { SpellChoiceSection } from '../spells/spell-choice-section.client'
import { SpellPickerDrawer } from '../spells/spell-picker-drawer.client'
import { SpellcastingSummaryCard } from '../spells/spellcasting-summary-card.client'

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
  const profile = useMemo(() => resolveSpellcastingProfile(draft, context), [context, draft])
  const choiceSets = useMemo(
    () => choiceSetsForSpellsStep(resolvedChoiceSets),
    [resolvedChoiceSets],
  )
  const [openChoiceSetId, setOpenChoiceSetId] = useState<string | null>(null)

  const activeChoiceSet = choiceSets.find((choiceSet) => choiceSet.id === openChoiceSetId)
  const pickerItems = useMemo(() => {
    if (!activeChoiceSet) return []
    return resolveSpellPickerItems({
      draft,
      context,
      choiceSetId: activeChoiceSet.id,
    })
  }, [activeChoiceSet, context, draft])

  if (!profile) {
    return (
      <BuilderStepFrame stepId="spells" validationIssues={validationIssues}>
        <Text variant="muted">{SPELLS_STEP_NON_CASTER_MESSAGE}</Text>
      </BuilderStepFrame>
    )
  }

  return (
    <BuilderStepFrame stepId="spells" validationIssues={validationIssues}>
      <div className="space-y-6">
        <SpellcastingSummaryCard profile={profile} preview={preview} />

        {choiceSets.map((choiceSet) => {
          const selectedIds = draft.choiceSelections[choiceSet.id] ?? []

          return (
            <SpellChoiceSection
              key={choiceSet.id}
              choiceSet={choiceSet}
              selectedIds={selectedIds}
              onAdd={() => setOpenChoiceSetId(choiceSet.id)}
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

      {activeChoiceSet ? (
        <SpellPickerDrawer
          open
          onOpenChange={(open) => {
            if (!open) setOpenChoiceSetId(null)
          }}
          choiceSet={activeChoiceSet}
          selectedIds={draft.choiceSelections[activeChoiceSet.id] ?? []}
          items={pickerItems}
          onSelectSpell={(spellId) => {
            const current = draft.choiceSelections[activeChoiceSet.id] ?? []
            if (current.includes(spellId)) return
            onDraftChange({
              choiceSelections: withChoiceSetSelections(draft, activeChoiceSet.id, [
                ...current,
                spellId,
              ]),
            })
          }}
          onRemoveSpell={(spellId) => {
            const current = draft.choiceSelections[activeChoiceSet.id] ?? []
            onDraftChange({
              choiceSelections: withChoiceSetSelections(
                draft,
                activeChoiceSet.id,
                current.filter((id) => id !== spellId),
              ),
            })
          }}
        />
      ) : null}
    </BuilderStepFrame>
  )
}
