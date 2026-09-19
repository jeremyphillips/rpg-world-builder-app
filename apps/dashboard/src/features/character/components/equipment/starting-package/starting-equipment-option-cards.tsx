import { useCallback, useMemo, useState } from 'react'

import {
  isStartingGoldOption,
  type CharacterBuilderDraft,
  type CharacterBuildCatalogIndex,
  type CharacterClass,
  type ChoiceSet,
  type StartingEquipmentOption,
  type StartingEquipmentOptionSummary,
} from '@rpg/contracts'
import { ComboboxField, RadioCard, Text, type RadioCardOption } from '@rpg/ui'

import { ChoiceSetField } from '../../builder/fields/choice-set-field'
import {
  EQUIPMENT_INCLUDED_TOOL_RELATIONSHIP_GUIDANCE,
  EQUIPMENT_INCLUDED_TOOL_RESOLVED_ANNOTATION,
  EQUIPMENT_INCLUDED_TOOL_SECTION_LABEL,
  EQUIPMENT_INVALID_PROFICIENCY_LINK_MESSAGE,
  areNestedPoolsResolved,
  findChoiceSetById,
  listNestedPoolsForOption,
  listProficiencyLinksForOption,
  resolveProficiencyLinkFieldState,
  startingEquipmentOptionFundingSummaryLines,
  type StartingEquipmentNestedPool,
} from '../../../lib/equipment/equipment-step.lib'
import {
  startingEquipmentOptionNestedFieldsClasses,
  startingEquipmentOptionReasonsClasses,
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

function StartingEquipmentUnselectableReasons({ reasons }: { reasons: readonly string[] }) {
  return (
    <div className={startingEquipmentOptionReasonsClasses}>
      {reasons.map((reason) => (
        <Text key={reason} variant="small" className="text-destructive">
          {reason}
        </Text>
      ))}
    </div>
  )
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

function StartingEquipmentNestedFields({
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
}) {
  const option = characterClass.characterCreation?.startingEquipment?.options.find(
    (entry) => entry.id === summary.optionId,
  )
  const nestedPools = listNestedPoolsForOption(characterClass, summary.optionId, catalogIndex)
  const proficiencyLinks = option ? listProficiencyLinksForOption(characterClass, option) : []

  return (
    <div
      className={startingEquipmentOptionNestedFieldsClasses}
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
  )
}

function buildPackageRadioCardOption({
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
}): RadioCardOption {
  const option = characterClass.characterCreation?.startingEquipment?.options.find(
    (entry) => entry.id === summary.optionId,
  )
  const nestedPools = listNestedPoolsForOption(characterClass, summary.optionId, catalogIndex)
  const proficiencyLinks = option ? listProficiencyLinksForOption(characterClass, option) : []
  const hasNestedFields = nestedPools.length > 0 || proficiencyLinks.length > 0

  return {
    value: summary.optionId,
    disabled: !summary.isSelectable,
    label: summary.label,
    description: summary.description,
    summaryLines: startingEquipmentOptionFundingSummaryLines(summary),
    embeddedContent: hasNestedFields ? (
      <StartingEquipmentNestedFields
        summary={summary}
        characterClass={characterClass}
        catalogIndex={catalogIndex}
        draft={draft}
        resolvedChoiceSets={resolvedChoiceSets}
        selectedOptionId={selectedOptionId}
        pendingNestedSelections={pendingNestedSelections}
        onSelectOption={onSelectOption}
        onNestedPoolChange={onNestedPoolChange}
        onChoiceSelectionChange={onChoiceSelectionChange}
      />
    ) : undefined,
    footerContent:
      summary.unselectableReasons.length > 0 ? (
        <StartingEquipmentUnselectableReasons reasons={summary.unselectableReasons} />
      ) : undefined,
  }
}

function buildGoldRadioCardOption(summary: StartingEquipmentOptionSummary): RadioCardOption {
  return {
    value: summary.optionId,
    disabled: !summary.isSelectable,
    label: summary.label,
    description: summary.description,
    summaryLines: startingEquipmentOptionFundingSummaryLines(summary),
    footerContent:
      summary.unselectableReasons.length > 0 ? (
        <StartingEquipmentUnselectableReasons reasons={summary.unselectableReasons} />
      ) : undefined,
  }
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

  const options = characterClass.characterCreation?.startingEquipment?.options ?? []
  const goldOption = options.find(isStartingGoldOption)
  const packageOptionIds = new Set(
    options.filter((option) => !isStartingGoldOption(option)).map((option) => option.id),
  )
  const packageSummaries = summaries.filter((summary) => packageOptionIds.has(summary.optionId))
  const goldSummary = goldOption
    ? summaries.find((summary) => summary.optionId === goldOption.id)
    : undefined

  const handleNestedPoolChange = useCallback<
    StartingEquipmentOptionCardsProps['onNestedPoolChange']
  >(
    (optionId, choiceSetId, selection, nestedSelections) => {
      setPendingNestedSelections((current) => ({
        ...current,
        [optionId]: {
          ...(current[optionId] ?? {}),
          [choiceSetId]: selection,
        },
      }))
      onNestedPoolChange(optionId, choiceSetId, selection, nestedSelections)
    },
    [onNestedPoolChange],
  )

  const radioCardOptions = useMemo(() => {
    const packageOptions = packageSummaries.map((summary) =>
      buildPackageRadioCardOption({
        summary,
        characterClass,
        catalogIndex,
        draft,
        resolvedChoiceSets,
        selectedOptionId,
        pendingNestedSelections,
        onSelectOption,
        onNestedPoolChange: handleNestedPoolChange,
        onChoiceSelectionChange,
      }),
    )

    return goldSummary ? [...packageOptions, buildGoldRadioCardOption(goldSummary)] : packageOptions
  }, [
    catalogIndex,
    characterClass,
    draft,
    goldSummary,
    handleNestedPoolChange,
    onChoiceSelectionChange,
    onSelectOption,
    packageSummaries,
    pendingNestedSelections,
    resolvedChoiceSets,
    selectedOptionId,
  ])

  return (
    <RadioCard
      aria-label="Starting equipment options"
      value={selectedOptionId ?? ''}
      onValueChange={(optionId) => {
        if (!optionId) return

        if (optionId === selectedOptionId && isPackageChooserExpanded) {
          onCollapseChooser()
          return
        }

        const pending = pendingNestedSelections[optionId] ?? {}
        const nestedSelections = {
          ...draft.choiceSelections,
          ...pending,
        }

        onSelectOption(optionId, nestedSelections)
      }}
      options={radioCardOptions}
    />
  )
}
