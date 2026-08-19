'use client'

import type { ReactNode } from 'react'
import { Button, CollapsibleRadioCardField, FieldLabelContent, NumberStepper, Text } from '@rpg/ui'

import {
  isCreateSetupGroupedChoiceSummaryReady,
  resolveCreateSetupCollapsedCompleteGroupedSetIds,
  resolveCreateSetupGroupedChoiceRows,
  resolveCreateSetupSummaryGroupEyebrow,
  resolveCreateSetupSummaryGroupMemberIds,
  resolveCreateSetupSummaryGroups,
} from './create-setup-completed-choice-groups.lib'
import {
  resolveCreateSetupSetExpanded,
  resolveCreateSetupSetIdsToInvalidate,
} from './create-setup-sequence.lib'
import { SetupSummaryCard, SetupSummaryCardChangeAction } from './setup-summary-card.client'
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
}

function resolvePanelSetExpanded(
  set: CreateSetupSet,
  input: Pick<BuildCreateSetupPanelItemsInput, 'model'>,
) {
  return resolveCreateSetupSetExpanded({
    setId: set.id,
    activeSetId: input.model.activeSetId,
    reopenSetId: input.model.reopenSetId,
    visible: true,
    isComplete: set.isComplete,
    required: set.required,
    collapseWhenComplete: set.collapseWhenComplete ?? true,
    collapseWhenActiveAndComplete: set.collapseWhenActiveAndComplete ?? false,
  })
}

function emitSetupValueChange(
  input: BuildCreateSetupPanelItemsInput,
  set: CreateSetupSet,
  nextValue: string | number,
  skipped = false,
) {
  const previousValue = set.kind === 'choice' ? set.value : set.value
  if (!skipped && nextValue === previousValue) {
    if (input.model.reopenSetId === set.id) {
      input.model.reopen(null)
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

function renderChoiceSet(
  set: CreateSetupChoiceSet,
  expanded: boolean,
  input: BuildCreateSetupPanelItemsInput,
) {
  const showSkip = set.skipLabel != null && expanded && !set.isComplete

  return (
    <div key={set.id} className="flex flex-col gap-y-3">
      <CollapsibleRadioCardField
        id={`${input.baseId}-${set.id}`}
        label={set.prompt ?? set.fieldLabel}
        summaryEyebrow={set.fieldLabel}
        changeLabel={input.changeLabel}
        summaryDescription={false}
        collapseAfterSelect={false}
        density="compact"
        value={set.value}
        options={set.options}
        optionGroups={set.optionGroups}
        expanded={expanded}
        onExpandedChange={(nextExpanded) => {
          if (nextExpanded) {
            input.model.reopen(set.id)
            return
          }
          if (input.model.reopenSetId === set.id) {
            input.model.reopen(null)
          }
        }}
        onValueChange={(nextValue) => {
          emitSetupValueChange(input, set, nextValue)
        }}
      />
      {showSkip ? (
        <Button
          type="button"
          variant="link"
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

function renderNumberSet(
  set: Extract<CreateSetupSet, { kind: 'number' }>,
  input: BuildCreateSetupPanelItemsInput,
) {
  return (
    <div key={set.id} data-field-align className="flex flex-col gap-y-4">
      <FieldLabelContent label={set.fieldLabel} />
      {set.prompt ? (
        <Text variant="muted" className="text-sm">
          {set.prompt}
        </Text>
      ) : null}
      <NumberStepper
        aria-label={set.fieldLabel}
        size="sm"
        bordered
        digits={set.digits ?? 2}
        min={set.min}
        max={set.max}
        value={set.value}
        onChange={(nextValue) => {
          emitSetupValueChange(input, set, nextValue)
        }}
      />
    </div>
  )
}

function renderGroupedSummary(
  input: BuildCreateSetupPanelItemsInput,
  summaryGroup: string,
  collapsedCompleteSetIds: readonly string[],
): ReactNode {
  const groupMemberSetIds = resolveCreateSetupSummaryGroupMemberIds(input.sets, summaryGroup)
  const groupedRows = resolveCreateSetupGroupedChoiceRows({
    groupMemberSetIds,
    setById: buildCreateSetupChoiceSetMap(input.sets),
    collapsedCompleteSetIds,
  })
  const eyebrow =
    resolveCreateSetupSummaryGroupEyebrow(input.sets, summaryGroup) ??
    groupMemberSetIds
      .map((setId) => input.sets.find((set) => set.id === setId)?.summaryGroupEyebrow)
      .find(Boolean) ??
    summaryGroup

  return (
    <SetupSummaryCard
      key={`grouped-${summaryGroup}`}
      eyebrow={eyebrow}
      rows={groupedRows.map((row) => {
        const valueActionAriaLabel = `Change ${row.label.toLowerCase()}`

        return {
          label: row.label,
          value: row.valueLabel,
          onValueClick: () => input.model.reopen(row.setId),
          valueActionAriaLabel,
          action: (
            <SetupSummaryCardChangeAction
              changeLabel={input.changeLabel}
              ariaLabel={valueActionAriaLabel}
              onChange={() => input.model.reopen(row.setId)}
            />
          ),
        }
      })}
    />
  )
}

export function buildCreateSetupPanelItems(input: BuildCreateSetupPanelItemsInput): ReactNode[] {
  const visibleSetIds = input.model.visibleSetIds
  const setById = buildCreateSetupSetMap(input.sets)
  const summaryGroups = resolveCreateSetupSummaryGroups(input.sets)

  const isCollapsedComplete = (setId: string) => {
    const set = setById.get(setId)
    if (!set) return false
    return set.isComplete && !resolvePanelSetExpanded(set, input)
  }

  const renderedSetIds = new Set<string>()
  const panelItems: ReactNode[] = []

  for (const setId of visibleSetIds) {
    if (renderedSetIds.has(setId)) {
      continue
    }

    const set = setById.get(setId)
    if (!set) {
      continue
    }

    const summaryGroup = set.summaryGroup
    if (summaryGroup) {
      const groupMemberSetIds = summaryGroups.get(summaryGroup) ?? []
      const groupedSummaryReady = isCreateSetupGroupedChoiceSummaryReady({
        groupMemberSetIds,
        visibleSetIds,
        isCollapsedComplete,
      })

      if (groupedSummaryReady && groupMemberSetIds[0] === setId) {
        const collapsedCompleteGroupedSetIds = resolveCreateSetupCollapsedCompleteGroupedSetIds({
          groupMemberSetIds,
          visibleSetIds,
          isCollapsedComplete,
        })
        panelItems.push(renderGroupedSummary(input, summaryGroup, collapsedCompleteGroupedSetIds))
        for (const groupedSetId of collapsedCompleteGroupedSetIds) {
          renderedSetIds.add(groupedSetId)
        }
        continue
      }
    }

    renderedSetIds.add(setId)

    if (set.kind === 'choice') {
      panelItems.push(renderChoiceSet(set, resolvePanelSetExpanded(set, input), input))
      continue
    }

    panelItems.push(renderNumberSet(set, input))
  }

  return panelItems
}

export function buildCreateSetupChoiceSetMap(
  sets: readonly CreateSetupSet[],
): Map<string, CreateSetupChoiceSet> {
  const map = new Map<string, CreateSetupChoiceSet>()
  for (const set of sets) {
    if (set.kind === 'choice') {
      map.set(set.id, set)
    }
  }
  return map
}

export function buildCreateSetupSetMap(
  sets: readonly CreateSetupSet[],
): Map<string, CreateSetupSet> {
  return new Map(sets.map((set) => [set.id, set]))
}
