import type { ReactNode } from 'react'
import { Button, RadioCardField, SelectionSummaryCard } from '@rpg/ui'

import {
  resolveCreateSetupSetExpanded,
  resolveCreateSetupSetIdsToInvalidate,
} from './create-setup-sequence.lib'
import {
  createChoiceSetSummaryDefinitions,
  resolveSetupSummaryCards,
  type SetupSummaryCard,
} from './resolve-setup-summary-rows.lib'
import { mapSetupSummaryRowsToSelectionProps } from './setup-summary-row-models'
import type {
  CreateSetupChoiceSet,
  CreateSetupSequenceModel,
  CreateSetupSet,
  CreateSetupValueChangeEvent,
} from './create-setup.types'

export type BuildCreateSetupPanelItemsInput = {
  baseId: string
  sets: readonly CreateSetupSet[]
  model: CreateSetupSequenceModel
  changeLabel: string
  onSetupValueChange: (event: CreateSetupValueChangeEvent) => void
  /** When omitted, rows are derived from choice sets. */
  summaryCards?: readonly SetupSummaryCard[]
  /** When omitted, the active choice set is the row without Change. */
  activeSummaryTargetId?: string | null
  onSummaryNavigate?: (targetSetId: string) => void
}

function emitSetupValueChange(
  input: BuildCreateSetupPanelItemsInput,
  set: CreateSetupSet,
  nextValue: string | number,
  skipped = false,
) {
  const previousValue = set.value
  if (!skipped && nextValue === previousValue) {
    if (input.model.reopenSetId === set.id) {
      const onDismiss = input.model.takeEditSessionDismiss()
      input.model.reopen(null)
      onDismiss?.()
    }
    return
  }

  if (input.model.reopenSetId === set.id) {
    input.model.reopen(null)
  }

  const sequenceItems = input.sets.map((item) => ({
    id: item.id,
    dependsOn: item.dependsOn,
  }))

  input.onSetupValueChange({
    setId: set.id,
    previousValue,
    nextValue,
    invalidatedSetIds: resolveCreateSetupSetIdsToInvalidate({
      sets: sequenceItems,
      changedSetId: set.id,
    }),
    ...(skipped ? { skipped: true } : {}),
  })
}

function renderActiveChoiceSet(set: CreateSetupChoiceSet, input: BuildCreateSetupPanelItemsInput) {
  const showSkip = set.skipLabel != null && !set.isComplete

  return (
    <div key={set.id} className="flex flex-col gap-y-3">
      <RadioCardField
        id={`${input.baseId}-${set.id}`}
        label={set.prompt ?? set.fieldLabel}
        density="compact"
        value={set.value}
        options={set.options}
        optionGroups={set.optionGroups}
        onValueChange={(nextValue) => {
          emitSetupValueChange(input, set, nextValue)
        }}
      />
      {showSkip ? (
        <Button
          type="button"
          variant="text"
          size="sm"
          className="self-start"
          onClick={() => {
            emitSetupValueChange(input, set, set.value, true)
          }}
        >
          {set.skipLabel}
        </Button>
      ) : null}
    </div>
  )
}

function resolvePanelSummaryCards(
  input: BuildCreateSetupPanelItemsInput,
): readonly SetupSummaryCard[] {
  return (
    input.summaryCards ??
    resolveSetupSummaryCards(input.sets, createChoiceSetSummaryDefinitions(input.sets))
  )
}

function renderSummaryCard(
  input: BuildCreateSetupPanelItemsInput,
  card: SetupSummaryCard,
): ReactNode {
  if (card.rows.length === 0) return null

  const activeTargetId =
    input.activeSummaryTargetId !== undefined
      ? input.activeSummaryTargetId
      : input.model.activeSetId
  const onNavigate =
    input.onSummaryNavigate ?? ((targetSetId: string) => input.model.reopen(targetSetId))

  return (
    <SelectionSummaryCard
      key={card.id}
      eyebrow={card.eyebrow}
      rows={mapSetupSummaryRowsToSelectionProps({
        rows: card.rows,
        activeTargetId,
        changeLabel: input.changeLabel,
        onNavigate,
      })}
    />
  )
}

export function buildCreateSetupPanelItems(input: BuildCreateSetupPanelItemsInput): ReactNode[] {
  const { model, sets } = input
  const setById = buildCreateSetupSetMap(sets)
  const panelItems: ReactNode[] = []

  for (const card of resolvePanelSummaryCards(input)) {
    const summaryCard = renderSummaryCard(input, card)
    if (summaryCard) panelItems.push(summaryCard)
  }

  for (const setId of model.visibleSetIds) {
    const set = setById.get(setId)
    if (!set) continue

    const isActive = resolveCreateSetupSetExpanded({
      setId: set.id,
      activeSetId: model.activeSetId,
      reopenSetId: model.reopenSetId,
    })

    if (isActive) {
      panelItems.push(renderActiveChoiceSet(set, input))
    }
  }

  return panelItems
}

export function buildCreateSetupSetMap(
  sets: readonly CreateSetupSet[],
): Map<string, CreateSetupSet> {
  return new Map(sets.map((set) => [set.id, set]))
}
