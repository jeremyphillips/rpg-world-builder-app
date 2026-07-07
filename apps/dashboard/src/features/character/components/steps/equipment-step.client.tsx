'use client'

import { useMemo, useState } from 'react'

import {
  deriveEquipmentDraftEntries,
  indexCharacterBuildCatalog,
  resolveStartingEquipmentOptionSummaries,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuildValidationIssue,
  type ChoiceSet,
} from '@rpg/contracts'
import { Button, ConfirmDialog, Heading, Text } from '@rpg/ui'

import {
  EQUIPMENT_STEP_CONTINUE_WITHOUT_LABEL,
  EQUIPMENT_STEP_NO_CLASS_MESSAGE,
  EQUIPMENT_STEP_NO_STARTING_EQUIPMENT_MESSAGE,
  EQUIPMENT_STEP_NO_VALID_OPTIONS_MESSAGE,
  EQUIPMENT_STEP_SWITCH_CONFIRM_DESCRIPTION,
  EQUIPMENT_STEP_SWITCH_CONFIRM_HEADLINE,
  buildEquipmentSelectionPatch,
  buildEquipmentSkipPatch,
  choiceSetsForEquipmentStep,
  findStartingEquipmentChoiceSet,
  hasGoldStartingEquipmentOption,
  readSelectedStartingEquipmentOption,
  shouldShowEquipmentFallback,
} from '../../lib/equipment-step.lib'
import { EquipmentInventorySummary } from '../equipment/equipment-inventory-summary.client'
import { StartingEquipmentOptionCards } from '../equipment/starting-equipment-option-cards.client'
import { BuilderStepFrame } from './builder-step-frame.client'

export type EquipmentStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

type PendingEquipmentSelection = {
  optionId: string
  nestedSelections: CharacterBuilderDraft['choiceSelections']
}

export function EquipmentStep({
  context,
  draft,
  resolvedChoiceSets,
  validationIssues,
  onDraftChange,
}: EquipmentStepProps) {
  const [pendingSelection, setPendingSelection] = useState<PendingEquipmentSelection | null>(null)
  const classId = draft.class.classId
  const catalogIndex = useMemo(() => indexCharacterBuildCatalog(context.catalog), [context.catalog])
  const characterClass = classId ? catalogIndex.classes.get(classId) : undefined
  const equipmentChoiceSets = useMemo(
    () => choiceSetsForEquipmentStep(resolvedChoiceSets),
    [resolvedChoiceSets],
  )
  const startingEquipmentChoiceSet = classId
    ? findStartingEquipmentChoiceSet(resolvedChoiceSets, classId)
    : undefined
  const summaries = useMemo(
    () =>
      characterClass ? resolveStartingEquipmentOptionSummaries(characterClass, catalogIndex) : [],
    [catalogIndex, characterClass],
  )
  const inventory = useMemo(
    () => deriveEquipmentDraftEntries(draft, catalogIndex),
    [catalogIndex, draft],
  )
  const selectedOptionId = readSelectedStartingEquipmentOption(draft, classId)
  const showFallback =
    shouldShowEquipmentFallback(summaries) && !hasGoldStartingEquipmentOption(summaries)

  const applySelection = (selection: PendingEquipmentSelection) => {
    if (!classId || !startingEquipmentChoiceSet) return

    onDraftChange(
      buildEquipmentSelectionPatch({
        draft,
        classId,
        optionId: selection.optionId,
        choiceSetId: startingEquipmentChoiceSet.id,
        nestedSelections: selection.nestedSelections,
      }),
    )
  }

  const requestSelection = (
    optionId: string,
    nestedSelections: CharacterBuilderDraft['choiceSelections'],
  ) => {
    if (!classId || !startingEquipmentChoiceSet) return
    if (optionId === selectedOptionId) return

    const nextSelection = { optionId, nestedSelections }
    if (draft.equipment?.customized) {
      setPendingSelection(nextSelection)
      return
    }

    applySelection(nextSelection)
  }

  if (!classId || !characterClass) {
    return (
      <BuilderStepFrame stepId="equipment" validationIssues={validationIssues}>
        <Text variant="muted">{EQUIPMENT_STEP_NO_CLASS_MESSAGE}</Text>
      </BuilderStepFrame>
    )
  }

  if (equipmentChoiceSets.length === 0 || summaries.length === 0) {
    return (
      <BuilderStepFrame stepId="equipment" validationIssues={validationIssues}>
        <Text variant="muted">{EQUIPMENT_STEP_NO_STARTING_EQUIPMENT_MESSAGE}</Text>
      </BuilderStepFrame>
    )
  }

  if (draft.equipment?.skipped) {
    return (
      <BuilderStepFrame stepId="equipment" validationIssues={validationIssues}>
        <Text variant="muted">Continuing without starting equipment.</Text>
      </BuilderStepFrame>
    )
  }

  return (
    <BuilderStepFrame stepId="equipment" validationIssues={validationIssues}>
      <div className="space-y-8">
        {showFallback ? (
          <div className="space-y-4">
            <Text>{EQUIPMENT_STEP_NO_VALID_OPTIONS_MESSAGE}</Text>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onDraftChange({ equipment: buildEquipmentSkipPatch() })}
            >
              {EQUIPMENT_STEP_CONTINUE_WITHOUT_LABEL}
            </Button>
          </div>
        ) : (
          <StartingEquipmentOptionCards
            characterClass={characterClass}
            catalogIndex={catalogIndex}
            summaries={summaries}
            draft={draft}
            selectedOptionId={selectedOptionId}
            onSelectOption={requestSelection}
            onNestedPoolChange={(optionId, choiceSetId, selection, nestedSelections) => {
              if (selectedOptionId !== optionId) return

              onDraftChange({
                choiceSelections: {
                  ...draft.choiceSelections,
                  ...nestedSelections,
                  [choiceSetId]: selection,
                },
              })
            }}
          />
        )}

        <section className="space-y-3">
          <Heading variant="subsection" as="h3">
            Inventory
          </Heading>
          <EquipmentInventorySummary inventory={inventory} catalogIndex={catalogIndex} />
        </section>
      </div>

      <ConfirmDialog
        open={pendingSelection !== null}
        onOpenChange={(open) => {
          if (!open) setPendingSelection(null)
        }}
        headline={EQUIPMENT_STEP_SWITCH_CONFIRM_HEADLINE}
        description={EQUIPMENT_STEP_SWITCH_CONFIRM_DESCRIPTION}
        confirmLabel="Switch equipment"
        cancelLabel="Keep current selection"
        onConfirm={() => {
          if (!pendingSelection) return
          applySelection(pendingSelection)
          setPendingSelection(null)
        }}
        onCancel={() => setPendingSelection(null)}
      />
    </BuilderStepFrame>
  )
}
