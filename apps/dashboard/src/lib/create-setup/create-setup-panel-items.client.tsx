'use client'

import type { ReactNode } from 'react'
import { Button, RadioCardField } from '@rpg/ui'

import {
  resolveCreateSetupPartialSummaryRows,
  resolveCreateSetupPartialSummarySegments,
  resolveCreateSetupSummaryGroupDisplayEyebrow,
} from './create-setup-completed-choice-groups.lib'
import {
  resolveCreateSetupSetExpanded,
  resolveCreateSetupSetIdsToInvalidate,
} from './create-setup-sequence.lib'
import { CREATE_SETUP_DEFAULT_GROUPED_SUMMARY_EYEBROW } from './create-setup.constants'
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

function emitSetupValueChange(
  input: BuildCreateSetupPanelItemsInput,
  set: CreateSetupSet,
  nextValue: string | number,
  skipped = false,
) {
  const previousValue = set.value
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

function renderPartialSummaryCard(
  input: BuildCreateSetupPanelItemsInput,
  eyebrow: string,
  setIds: readonly string[],
): ReactNode {
  const choiceSetById = buildCreateSetupChoiceSetMap(input.sets)
  const rows = resolveCreateSetupPartialSummaryRows({
    setIds,
    setById: choiceSetById,
  })

  if (rows.length === 0) {
    return null
  }

  return (
    <SetupSummaryCard
      key={`summary-${setIds.join('-')}`}
      eyebrow={eyebrow}
      rows={rows.map((row) => {
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

function resolveSummarySegmentKey(
  segment: ReturnType<typeof resolveCreateSetupPartialSummarySegments>[number],
): string {
  return segment.kind === 'group' ? `group:${segment.summaryGroup}` : `standalone:${segment.setId}`
}

function resolveSummaryCardEyebrow(
  sets: readonly CreateSetupSet[],
  setById: Map<string, CreateSetupSet>,
  segment: ReturnType<typeof resolveCreateSetupPartialSummarySegments>[number],
): string {
  if (segment.kind === 'group') {
    return resolveCreateSetupSummaryGroupDisplayEyebrow(sets, segment.summaryGroup)
  }

  const standaloneSet = setById.get(segment.setId)
  return (
    standaloneSet?.summaryGroupEyebrow ??
    standaloneSet?.fieldLabel ??
    CREATE_SETUP_DEFAULT_GROUPED_SUMMARY_EYEBROW
  )
}

function findSummarySegmentForSet(
  setId: string,
  summarySegments: ReturnType<typeof resolveCreateSetupPartialSummarySegments>,
) {
  return summarySegments.find((candidate) => {
    if (candidate.kind === 'standalone') {
      return candidate.setId === setId
    }
    return candidate.setIds.includes(setId)
  })
}

function appendCompletedSummaryItem(
  input: BuildCreateSetupPanelItemsInput,
  args: {
    set: CreateSetupSet
    sets: readonly CreateSetupSet[]
    setById: Map<string, CreateSetupSet>
    summarySegments: ReturnType<typeof resolveCreateSetupPartialSummarySegments>
    renderedSummaryKeys: Set<string>
    panelItems: ReactNode[]
  },
): boolean {
  const segment = findSummarySegmentForSet(args.set.id, args.summarySegments)
  if (!segment) {
    return false
  }

  const summaryKey = resolveSummarySegmentKey(segment)
  if (args.renderedSummaryKeys.has(summaryKey)) {
    return true
  }
  args.renderedSummaryKeys.add(summaryKey)

  const eyebrow = resolveSummaryCardEyebrow(args.sets, args.setById, segment)
  const setIds = segment.kind === 'group' ? segment.setIds : [segment.setId]
  const summaryCard = renderPartialSummaryCard(input, eyebrow, setIds)
  if (summaryCard) {
    args.panelItems.push(summaryCard)
  }

  return true
}

export function buildCreateSetupPanelItems(input: BuildCreateSetupPanelItemsInput): ReactNode[] {
  const { model, sets } = input
  const setById = buildCreateSetupSetMap(sets)
  const summarySegments = resolveCreateSetupPartialSummarySegments({
    sets,
    visibleSetIds: model.visibleSetIds,
    activeSetId: model.activeSetId,
  })
  const renderedSummaryKeys = new Set<string>()
  const panelItems: ReactNode[] = []

  for (const setId of model.visibleSetIds) {
    const set = setById.get(setId)
    if (!set) continue

    const isActive = resolveCreateSetupSetExpanded({
      setId: set.id,
      activeSetId: model.activeSetId,
      reopenSetId: model.reopenSetId,
    })

    if (!isActive && set.isComplete) {
      appendCompletedSummaryItem(input, {
        set,
        sets,
        setById,
        summarySegments,
        renderedSummaryKeys,
        panelItems,
      })
      continue
    }

    if (isActive) {
      panelItems.push(renderActiveChoiceSet(set, input))
    }
  }

  return panelItems
}

export function buildCreateSetupChoiceSetMap(
  sets: readonly CreateSetupSet[],
): Map<string, CreateSetupChoiceSet> {
  const map = new Map<string, CreateSetupChoiceSet>()
  for (const set of sets) {
    map.set(set.id, set)
  }
  return map
}

export function buildCreateSetupSetMap(
  sets: readonly CreateSetupSet[],
): Map<string, CreateSetupSet> {
  return new Map(sets.map((set) => [set.id, set]))
}
