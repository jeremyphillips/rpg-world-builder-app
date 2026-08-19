'use client'

import type { ReactNode } from 'react'
import { CollapsibleRadioCardField, FieldLabelContent, NumberStepper, Text } from '@rpg/ui'

import {
  isCreateSetupGroupedChoiceSummaryReady,
  resolveCreateSetupCollapsedCompleteGroupedSetIds,
  resolveCreateSetupGroupedChoiceRows,
} from './create-setup-completed-choice-groups.lib'
import {
  resolveCreateSetupSetExpanded,
  resolveCreateSetupSetIdsToInvalidate,
} from './create-setup-sequence.lib'
import { SetupSummaryCard, SetupSummaryCardChangeAction } from './setup-summary-card.client'
import type {
  CreateSetupChoiceSet,
  CreateSetupSequenceItem,
  CreateSetupSet,
} from './create-setup.types'

export type BuildCreateSetupPanelItemsInput = {
  baseId: string
  visibleSetIds: readonly string[]
  sequenceItems: readonly CreateSetupSequenceItem[]
  setById: ReadonlyMap<string, CreateSetupSet>
  choiceSetById: ReadonlyMap<string, CreateSetupChoiceSet>
  activeSetId: string | null
  reopenSetId: string | null
  changeLabel: string
  groupedChoiceSetIds: readonly string[]
  groupedSummaryEyebrow: string
  allowPartialGroupedSummary?: boolean
  setReopenSetId: (setId: string | null) => void
}

function resolvePanelSetExpanded(
  set: CreateSetupSet,
  input: Pick<BuildCreateSetupPanelItemsInput, 'activeSetId' | 'reopenSetId'>,
) {
  return resolveCreateSetupSetExpanded({
    setId: set.id,
    activeSetId: input.activeSetId,
    reopenSetId: input.reopenSetId,
    visible: true,
    isComplete: set.isComplete,
    required: set.required,
    collapseWhenComplete: set.collapseWhenComplete ?? true,
    collapseWhenActiveAndComplete: set.collapseWhenActiveAndComplete ?? false,
  })
}

function invalidateDependentSets(
  input: Pick<BuildCreateSetupPanelItemsInput, 'sequenceItems' | 'setById'>,
  changedSetId: string,
) {
  const invalidatedIds = resolveCreateSetupSetIdsToInvalidate({
    sets: input.sequenceItems,
    changedSetId,
  })

  for (const invalidatedId of invalidatedIds) {
    input.setById.get(invalidatedId)?.onReset()
  }
}

function renderChoiceSet(
  set: CreateSetupChoiceSet,
  expanded: boolean,
  input: BuildCreateSetupPanelItemsInput,
) {
  return (
    <CollapsibleRadioCardField
      key={set.id}
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
          input.setReopenSetId(set.id)
          return
        }
        if (input.reopenSetId === set.id) {
          input.setReopenSetId(null)
        }
      }}
      onValueChange={(nextValue) => {
        if (input.reopenSetId === set.id) {
          input.setReopenSetId(null)
        }
        invalidateDependentSets(input, set.id)
        set.onValueChange(nextValue)
      }}
    />
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
          invalidateDependentSets(input, set.id)
          set.onValueChange(nextValue)
        }}
      />
    </div>
  )
}

function resolveFirstVisibleGroupedSetId(input: BuildCreateSetupPanelItemsInput): string | null {
  return input.visibleSetIds.find((setId) => input.groupedChoiceSetIds.includes(setId)) ?? null
}

function renderGroupedSummary(
  input: BuildCreateSetupPanelItemsInput,
  collapsedCompleteSetIds: readonly string[],
): ReactNode {
  const groupedRows = resolveCreateSetupGroupedChoiceRows({
    groupedChoiceSetIds: input.groupedChoiceSetIds,
    setById: input.choiceSetById,
    collapsedCompleteSetIds,
  })

  return (
    <SetupSummaryCard
      key={`grouped-${input.groupedChoiceSetIds.join('-')}`}
      eyebrow={input.groupedSummaryEyebrow}
      rows={groupedRows.map((row) => {
        const valueActionAriaLabel = `Change ${row.label.toLowerCase()}`

        return {
          label: row.label,
          value: row.valueLabel,
          onValueClick: () => input.setReopenSetId(row.setId),
          valueActionAriaLabel,
          action: (
            <SetupSummaryCardChangeAction
              changeLabel={input.changeLabel}
              ariaLabel={valueActionAriaLabel}
              onChange={() => input.setReopenSetId(row.setId)}
            />
          ),
        }
      })}
    />
  )
}

export function buildCreateSetupPanelItems(input: BuildCreateSetupPanelItemsInput): ReactNode[] {
  const isCollapsedComplete = (setId: string) => {
    const set = input.setById.get(setId)
    if (!set) return false
    return set.isComplete && !resolvePanelSetExpanded(set, input)
  }

  const collapsedCompleteGroupedSetIds = resolveCreateSetupCollapsedCompleteGroupedSetIds({
    groupedChoiceSetIds: input.groupedChoiceSetIds,
    visibleSetIds: input.visibleSetIds,
    isCollapsedComplete,
  })

  const groupedSummaryReady = isCreateSetupGroupedChoiceSummaryReady({
    groupedChoiceSetIds: input.groupedChoiceSetIds,
    visibleSetIds: input.visibleSetIds,
    isCollapsedComplete,
    allowPartial: input.allowPartialGroupedSummary,
  })

  const firstVisibleGroupedSetId = resolveFirstVisibleGroupedSetId(input)

  const renderedSetIds = new Set<string>()
  const panelItems: ReactNode[] = []

  for (const setId of input.visibleSetIds) {
    if (renderedSetIds.has(setId)) {
      continue
    }

    if (
      groupedSummaryReady &&
      input.groupedChoiceSetIds.length > 0 &&
      setId === firstVisibleGroupedSetId
    ) {
      panelItems.push(renderGroupedSummary(input, collapsedCompleteGroupedSetIds))
      for (const groupedSetId of collapsedCompleteGroupedSetIds) {
        renderedSetIds.add(groupedSetId)
      }
      continue
    }

    const set = input.setById.get(setId)
    if (!set) {
      continue
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
