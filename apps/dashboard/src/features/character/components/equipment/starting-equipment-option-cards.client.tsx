'use client'

import { useMemo, useState } from 'react'

import type {
  CharacterBuilderDraft,
  CharacterBuildCatalogIndex,
  CharacterClass,
  StartingEquipmentOptionSummary,
} from '@rpg/contracts'
import { ComboboxField, RadioCardItem, RadioGroup, Text, cn } from '@rpg/ui'

import {
  STARTING_EQUIPMENT_GOLD_OPTION_ID,
  areNestedPoolsResolved,
  formatStartingEquipmentOptionMeta,
  formatStartingEquipmentWealth,
  isStartingGoldOptionId,
  listNestedPoolsForOption,
  type StartingEquipmentNestedPool,
} from '../../lib/equipment-step.lib'
import {
  startingEquipmentOptionCardListClasses,
  startingEquipmentOptionCardNestedFieldsClasses,
  startingEquipmentOptionCardReasonsClasses,
  startingEquipmentOptionCardShellClasses,
} from './starting-equipment-option-cards.variants'

export type StartingEquipmentOptionCardsProps = {
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  summaries: readonly StartingEquipmentOptionSummary[]
  draft: CharacterBuilderDraft
  selectedOptionId?: string
  onSelectOption: (
    optionId: string,
    nestedSelections: CharacterBuilderDraft['choiceSelections'],
  ) => void
  onNestedPoolChange: (
    optionId: string,
    choiceSetId: string,
    selection: string[],
    nestedSelections: CharacterBuilderDraft['choiceSelections'],
  ) => void
}

type PendingNestedSelections = Record<string, Record<string, string[]>>

function readNestedSelection(
  optionId: string,
  pool: StartingEquipmentNestedPool,
  selectedOptionId: string | undefined,
  draft: CharacterBuilderDraft,
  pendingNestedSelections: PendingNestedSelections,
): string {
  const source =
    selectedOptionId === optionId
      ? draft.choiceSelections
      : (pendingNestedSelections[optionId] ?? draft.choiceSelections)

  return source[pool.choiceSetId]?.[0] ?? ''
}

function buildNestedSelectionsPatch(
  optionId: string,
  choiceSetId: string,
  selection: string[],
  draft: CharacterBuilderDraft,
  pendingNestedSelections: PendingNestedSelections,
): CharacterBuilderDraft['choiceSelections'] {
  const pending = pendingNestedSelections[optionId] ?? {}
  return {
    ...draft.choiceSelections,
    ...pending,
    [choiceSetId]: selection,
  }
}

function PackageOptionCard({
  summary,
  characterClass,
  catalogIndex,
  draft,
  selectedOptionId,
  pendingNestedSelections,
  onSelectOption,
  onNestedPoolChange,
}: {
  summary: StartingEquipmentOptionSummary
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  draft: CharacterBuilderDraft
  selectedOptionId?: string
  pendingNestedSelections: PendingNestedSelections
  onSelectOption: StartingEquipmentOptionCardsProps['onSelectOption']
  onNestedPoolChange: StartingEquipmentOptionCardsProps['onNestedPoolChange']
}) {
  const nestedPools = useMemo(
    () => listNestedPoolsForOption(characterClass, summary.optionId, catalogIndex),
    [catalogIndex, characterClass, summary.optionId],
  )
  const disabled = !summary.isSelectable
  const meta = formatStartingEquipmentOptionMeta(summary)
  const isSelected = selectedOptionId === summary.optionId

  return (
    <div
      className={cn(
        startingEquipmentOptionCardShellClasses,
        isSelected && 'border-primary ring-1 ring-primary/20',
      )}
    >
      <RadioCardItem
        value={summary.optionId}
        disabled={disabled}
        label={summary.label}
        description={summary.description}
        meta={meta}
        className="border-0 bg-transparent p-4 shadow-none sm:p-4 data-[state=checked]:border-0 data-[state=checked]:bg-transparent data-[state=checked]:ring-0"
      />

      {isSelected && nestedPools.length > 0 ? (
        <div
          className={startingEquipmentOptionCardNestedFieldsClasses}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {nestedPools.map((pool) => (
            <ComboboxField
              key={pool.choiceSetId}
              id={`starting-equipment-${summary.optionId}-${pool.itemIndex}`}
              label={pool.label}
              required
              multiple={false}
              value={readNestedSelection(
                summary.optionId,
                pool,
                selectedOptionId,
                draft,
                pendingNestedSelections,
              )}
              onChange={(nextValue) => {
                const selection = Array.isArray(nextValue)
                  ? nextValue
                  : typeof nextValue === 'string' && nextValue.length > 0
                    ? [nextValue]
                    : []
                const patch = buildNestedSelectionsPatch(
                  summary.optionId,
                  pool.choiceSetId,
                  selection,
                  draft,
                  pendingNestedSelections,
                )
                onNestedPoolChange(summary.optionId, pool.choiceSetId, selection, patch)

                if (selectedOptionId === summary.optionId) return
                if (!areNestedPoolsResolved(nestedPools, patch)) return
                onSelectOption(summary.optionId, patch)
              }}
              enableSearch={false}
              options={pool.options.map((option) => ({
                value: option.id,
                label: option.label,
              }))}
              placeholder="Choose an item…"
              emptyMessage="No matching items"
            />
          ))}
        </div>
      ) : null}

      {summary.unselectableReasons.length > 0 ? (
        <div className={startingEquipmentOptionCardReasonsClasses}>
          {summary.unselectableReasons.map((reason) => (
            <Text key={reason} variant="small" className="text-destructive">
              {reason}
            </Text>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function GoldOptionCard({ summary }: { summary: StartingEquipmentOptionSummary }) {
  const wealth = formatStartingEquipmentWealth(summary.wealth)

  return (
    <div className={startingEquipmentOptionCardShellClasses}>
      <RadioCardItem
        value={summary.optionId}
        disabled={!summary.isSelectable}
        label={summary.label}
        description={summary.description ?? 'Buy your own gear with starting gold.'}
        meta={wealth ? [wealth] : undefined}
        className="border-0 bg-transparent p-4 shadow-none sm:p-4 data-[state=checked]:border-0 data-[state=checked]:bg-transparent data-[state=checked]:ring-0"
      />

      {summary.unselectableReasons.length > 0 ? (
        <div className={startingEquipmentOptionCardReasonsClasses}>
          {summary.unselectableReasons.map((reason) => (
            <Text key={reason} variant="small" className="text-destructive">
              {reason}
            </Text>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function StartingEquipmentOptionCards({
  characterClass,
  catalogIndex,
  summaries,
  draft,
  selectedOptionId,
  onSelectOption,
  onNestedPoolChange,
}: StartingEquipmentOptionCardsProps) {
  const [pendingNestedSelections, setPendingNestedSelections] = useState<PendingNestedSelections>(
    {},
  )

  const packageSummaries = summaries.filter((summary) => !isStartingGoldOptionId(summary.optionId))
  const goldSummary = summaries.find(
    (summary) => summary.optionId === STARTING_EQUIPMENT_GOLD_OPTION_ID,
  )

  const handleNestedPoolChange: StartingEquipmentOptionCardsProps['onNestedPoolChange'] = (
    optionId,
    choiceSetId,
    selection,
    nestedSelections,
  ) => {
    setPendingNestedSelections((current) => ({
      ...current,
      [optionId]: {
        ...(current[optionId] ?? {}),
        [choiceSetId]: selection,
      },
    }))
    onNestedPoolChange(optionId, choiceSetId, selection, nestedSelections)
  }

  return (
    <RadioGroup
      className={startingEquipmentOptionCardListClasses}
      value={selectedOptionId ?? ''}
      onValueChange={(optionId) => {
        if (!optionId) return

        const pending = pendingNestedSelections[optionId] ?? {}
        const nestedSelections = {
          ...draft.choiceSelections,
          ...pending,
        }

        onSelectOption(optionId, nestedSelections)
      }}
    >
      {packageSummaries.map((summary) => (
        <PackageOptionCard
          key={summary.optionId}
          summary={summary}
          characterClass={characterClass}
          catalogIndex={catalogIndex}
          draft={draft}
          selectedOptionId={selectedOptionId}
          pendingNestedSelections={pendingNestedSelections}
          onSelectOption={onSelectOption}
          onNestedPoolChange={handleNestedPoolChange}
        />
      ))}

      {goldSummary ? <GoldOptionCard summary={goldSummary} /> : null}
    </RadioGroup>
  )
}
