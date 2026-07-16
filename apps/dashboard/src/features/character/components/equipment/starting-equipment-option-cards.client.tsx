'use client'

import { useMemo, useState } from 'react'

import type {
  CharacterBuilderDraft,
  CharacterBuildCatalogIndex,
  CharacterClass,
  ChoiceSet,
  StartingEquipmentOption,
  StartingEquipmentOptionSummary,
} from '@rpg/contracts'
import { ComboboxField, RadioCardItem, RadioGroup, Text, cn } from '@rpg/ui'

import { ChoiceSetField } from '../choice-set-field.client'
import {
  EQUIPMENT_INCLUDED_TOOL_RELATIONSHIP_GUIDANCE,
  EQUIPMENT_INCLUDED_TOOL_RESOLVED_ANNOTATION,
  EQUIPMENT_INCLUDED_TOOL_SECTION_LABEL,
  EQUIPMENT_INVALID_PROFICIENCY_LINK_MESSAGE,
  STARTING_EQUIPMENT_GOLD_OPTION_ID,
  areNestedPoolsResolved,
  findChoiceSetById,
  formatStartingEquipmentOptionMeta,
  formatStartingEquipmentWealth,
  isStartingGoldOptionId,
  listNestedPoolsForOption,
  listProficiencyLinksForOption,
  resolveProficiencyLinkFieldState,
  type StartingEquipmentNestedPool,
} from '../../lib/equipment-step.lib'
import {
  startingEquipmentOptionCardListClasses,
  startingEquipmentOptionCardNestedFieldsClasses,
  startingEquipmentOptionCardRadioItemClasses,
  startingEquipmentOptionCardReasonsClasses,
  startingEquipmentOptionCardSelectedShellClasses,
  startingEquipmentOptionCardShellClasses,
  startingEquipmentOptionCardTitleClasses,
} from './starting-equipment-option-cards.variants'

export type StartingEquipmentOptionCardsProps = {
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  summaries: readonly StartingEquipmentOptionSummary[]
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
  selectedOptionId?: string
  isPackageChooserExpanded: boolean
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
  onChoiceSelectionChange: (choiceSetId: string, selection: readonly string[]) => void
  onCollapseChooser: () => void
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

function IncludedToolField({
  link,
  option,
  characterClass,
  catalogIndex,
  draft,
  resolvedChoiceSets,
  onChoiceSelectionChange,
}: {
  link: ReturnType<typeof listProficiencyLinksForOption>[number]
  option: StartingEquipmentOption
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
  onChoiceSelectionChange: StartingEquipmentOptionCardsProps['onChoiceSelectionChange']
}) {
  const choiceSet = findChoiceSetById(resolvedChoiceSets, link.choiceSetId)
  const fieldState = resolveProficiencyLinkFieldState({
    link,
    option,
    classId: characterClass.id,
    characterClass,
    choiceSet,
    choiceSelections: draft.choiceSelections,
    catalogIndex,
  })

  if (fieldState === 'invalid') {
    return (
      <Text variant="small" className="text-destructive">
        {EQUIPMENT_INVALID_PROFICIENCY_LINK_MESSAGE}
      </Text>
    )
  }

  if (!choiceSet) {
    return (
      <Text variant="small" className="text-destructive">
        {EQUIPMENT_INVALID_PROFICIENCY_LINK_MESSAGE}
      </Text>
    )
  }

  const selection = draft.choiceSelections[link.choiceSetId] ?? []
  const selectedOption = choiceSet.options.find((entry) => entry.id === selection[0])

  return (
    <div className="space-y-2">
      <Text variant="small" className="font-medium">
        {EQUIPMENT_INCLUDED_TOOL_SECTION_LABEL}
      </Text>
      <ChoiceSetField
        choiceSet={choiceSet}
        value={selection}
        onValueChange={(nextSelection) => onChoiceSelectionChange(link.choiceSetId, nextSelection)}
      />
      <Text variant="muted">{EQUIPMENT_INCLUDED_TOOL_RELATIONSHIP_GUIDANCE}</Text>
      {fieldState === 'resolved' && selectedOption ? (
        <Text variant="muted">{EQUIPMENT_INCLUDED_TOOL_RESOLVED_ANNOTATION}</Text>
      ) : null}
    </div>
  )
}

function PackageOptionCard({
  summary,
  characterClass,
  catalogIndex,
  draft,
  resolvedChoiceSets,
  selectedOptionId,
  pendingNestedSelections,
  onSelectOption,
  onNestedPoolChange,
  onChoiceSelectionChange,
  isPackageChooserExpanded,
  onCollapseChooser,
}: {
  summary: StartingEquipmentOptionSummary
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
  selectedOptionId?: string
  pendingNestedSelections: PendingNestedSelections
  onSelectOption: StartingEquipmentOptionCardsProps['onSelectOption']
  onNestedPoolChange: StartingEquipmentOptionCardsProps['onNestedPoolChange']
  onChoiceSelectionChange: StartingEquipmentOptionCardsProps['onChoiceSelectionChange']
  isPackageChooserExpanded: boolean
  onCollapseChooser: StartingEquipmentOptionCardsProps['onCollapseChooser']
}) {
  const option = characterClass.characterCreation?.startingEquipment?.options.find(
    (entry) => entry.id === summary.optionId,
  )
  const nestedPools = useMemo(
    () => listNestedPoolsForOption(characterClass, summary.optionId, catalogIndex),
    [catalogIndex, characterClass, summary.optionId],
  )
  const proficiencyLinks = useMemo(
    () => (option ? listProficiencyLinksForOption(characterClass, option) : []),
    [characterClass, option],
  )
  const disabled = !summary.isSelectable
  const meta = formatStartingEquipmentOptionMeta(summary)
  const isSelected = selectedOptionId === summary.optionId
  const showNestedFields = isSelected && (nestedPools.length > 0 || proficiencyLinks.length > 0)

  return (
    <div
      className={cn(
        startingEquipmentOptionCardShellClasses,
        isSelected && startingEquipmentOptionCardSelectedShellClasses,
      )}
    >
      <RadioCardItem
        value={summary.optionId}
        disabled={disabled}
        label={summary.label}
        description={summary.description}
        meta={meta}
        className={startingEquipmentOptionCardRadioItemClasses}
        titleClassName={startingEquipmentOptionCardTitleClasses}
        onClick={() => {
          if (isPackageChooserExpanded && isSelected) onCollapseChooser()
        }}
      />

      {showNestedFields ? (
        <div
          className={startingEquipmentOptionCardNestedFieldsClasses}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {proficiencyLinks.map((link) =>
            option ? (
              <IncludedToolField
                key={link.choiceSetId}
                link={link}
                option={option}
                characterClass={characterClass}
                catalogIndex={catalogIndex}
                draft={draft}
                resolvedChoiceSets={resolvedChoiceSets}
                onChoiceSelectionChange={onChoiceSelectionChange}
              />
            ) : null,
          )}

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
              options={pool.options.map((entry) => ({
                value: entry.id,
                label: entry.label,
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

function GoldOptionCard({
  summary,
  selectedOptionId,
  isPackageChooserExpanded,
  onCollapseChooser,
}: {
  summary: StartingEquipmentOptionSummary
  selectedOptionId?: string
  isPackageChooserExpanded: boolean
  onCollapseChooser: StartingEquipmentOptionCardsProps['onCollapseChooser']
}) {
  const wealth = formatStartingEquipmentWealth(summary.wealth)
  const isSelected = selectedOptionId === summary.optionId

  return (
    <div
      className={cn(
        startingEquipmentOptionCardShellClasses,
        isSelected && startingEquipmentOptionCardSelectedShellClasses,
      )}
    >
      <RadioCardItem
        value={summary.optionId}
        disabled={!summary.isSelectable}
        label={summary.label}
        description={summary.description ?? 'Buy your own gear with starting gold.'}
        meta={wealth ? [wealth] : undefined}
        className={startingEquipmentOptionCardRadioItemClasses}
        titleClassName={startingEquipmentOptionCardTitleClasses}
        onClick={() => {
          if (isPackageChooserExpanded && isSelected) onCollapseChooser()
        }}
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
  resolvedChoiceSets,
  selectedOptionId,
  isPackageChooserExpanded,
  onSelectOption,
  onNestedPoolChange,
  onChoiceSelectionChange,
  onCollapseChooser,
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
          resolvedChoiceSets={resolvedChoiceSets}
          selectedOptionId={selectedOptionId}
          pendingNestedSelections={pendingNestedSelections}
          onSelectOption={onSelectOption}
          onNestedPoolChange={handleNestedPoolChange}
          onChoiceSelectionChange={onChoiceSelectionChange}
          isPackageChooserExpanded={isPackageChooserExpanded}
          onCollapseChooser={onCollapseChooser}
        />
      ))}

      {goldSummary ? (
        <GoldOptionCard
          summary={goldSummary}
          selectedOptionId={selectedOptionId}
          isPackageChooserExpanded={isPackageChooserExpanded}
          onCollapseChooser={onCollapseChooser}
        />
      ) : null}
    </RadioGroup>
  )
}
