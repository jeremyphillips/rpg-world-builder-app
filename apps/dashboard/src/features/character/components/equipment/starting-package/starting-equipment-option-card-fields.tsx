import {
  type CharacterBuilderDraft,
  type CharacterBuildCatalogIndex,
  type CharacterClass,
  type ChoiceSet,
  type StartingEquipmentOption,
  type StartingEquipmentOptionSummary,
} from '@rpg/contracts'
import { ComboboxField, Eyebrow, Text } from '@rpg/ui'

import { ChoiceSetField } from '../../builder/fields/choice-set-field'
import {
  EQUIPMENT_INCLUDED_TOOL_RELATIONSHIP_GUIDANCE,
  EQUIPMENT_INCLUDED_TOOL_SECTION_LABEL,
  EQUIPMENT_INVALID_PROFICIENCY_LINK_MESSAGE,
  areNestedPoolsResolved,
  findChoiceSetById,
  listNestedPoolsForOption,
  listProficiencyLinksForOption,
  resolveProficiencyLinkFieldState,
  type StartingEquipmentNestedPool,
} from '../../../lib/equipment/equipment-step.lib'
import {
  startingEquipmentIncludedToolGuidanceClasses,
  startingEquipmentIncludedToolHeadingClasses,
  startingEquipmentOptionNestedFieldsClasses,
  startingEquipmentOptionReasonsClasses,
} from './starting-equipment-option-cards.variants'

export type StartingEquipmentOptionSelectionHandlers = {
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
}

export type PendingNestedSelections = Record<string, Record<string, string[]>>

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

export function StartingEquipmentUnselectableReasons({ reasons }: { reasons: readonly string[] }) {
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
  onChoiceSelectionChange: StartingEquipmentOptionSelectionHandlers['onChoiceSelectionChange']
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

  return (
    <div>
      <Eyebrow size="sm" className={startingEquipmentIncludedToolHeadingClasses}>
        {EQUIPMENT_INCLUDED_TOOL_SECTION_LABEL}
      </Eyebrow>
      <div className="space-y-2">
        <ChoiceSetField
          choiceSet={choiceSet}
          value={selection}
          onValueChange={(nextSelection) =>
            onChoiceSelectionChange(link.choiceSetId, nextSelection)
          }
        />
        <Text variant="muted" className={startingEquipmentIncludedToolGuidanceClasses}>
          {EQUIPMENT_INCLUDED_TOOL_RELATIONSHIP_GUIDANCE}
        </Text>
      </div>
    </div>
  )
}

export function StartingEquipmentNestedFields({
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
  onSelectOption: StartingEquipmentOptionSelectionHandlers['onSelectOption']
  onNestedPoolChange: StartingEquipmentOptionSelectionHandlers['onNestedPoolChange']
  onChoiceSelectionChange: StartingEquipmentOptionSelectionHandlers['onChoiceSelectionChange']
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
