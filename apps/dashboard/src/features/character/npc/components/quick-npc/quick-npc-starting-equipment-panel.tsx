import * as React from 'react'
import { useFormContext } from 'react-hook-form'

import {
  getEquipmentKindLabel,
  type CharacterBuildContext,
  type NpcStartingChoices,
} from '@rpg/contracts'
import {
  ActionButton,
  ComboboxField,
  ComboboxFilterSelect,
  type ComboboxFieldOption,
} from '@rpg/ui'

import { StartingEquipmentOptionSection } from '@/features/character/components/equipment/starting-package/starting-equipment-option-section'
import {
  EQUIPMENT_STARTING_PACKAGE_SECTION_LABEL,
  formatPackageInventoryRowTitle,
} from '@/features/character/lib/equipment/equipment-step.lib'

import { EntityAnatomyHost } from '@/features/content'

import {
  filterQuickNpcAdditionalEquipmentByKind,
  resolveQuickNpcAdditionalEquipmentKindOptions,
  type QuickNpcAdditionalEquipmentOption,
} from '../../lib/quick-npc/quick-npc-additional-equipment.lib'
import {
  QUICK_NPC_EQUIPMENT_SELECTION_FIELD_NAME,
  QUICK_NPC_STARTING_CHOICE_OVERRIDES_FIELD_NAME,
  type QuickNpcAuthoringTabFormValues,
  type QuickNpcEquipmentSelection,
} from '../../lib/quick-npc/quick-npc-form-fields'
import type { QuickNpcSetupValues } from '../../lib/quick-npc/quick-npc-form-fields'
import {
  formatStartingChoiceItemCount,
  resolveQuickNpcStartingEquipmentPackageContext,
} from '../../lib/quick-npc/quick-npc-starting-equipment.lib'
import { quickNpcStartingChoiceAddControlClasses } from './quick-npc-starting-choices.variants'

type QuickNpcStartingEquipmentPackageContext = NonNullable<
  ReturnType<typeof resolveQuickNpcStartingEquipmentPackageContext>
>
import { QuickNpcStartingChoiceSubsectionHeader } from './quick-npc-starting-choice-subsection-header'
import {
  quickNpcStartingChoiceInnerSectionClasses,
  quickNpcStartingChoiceSelectedListClasses,
} from './quick-npc-starting-choices.variants'

const QUICK_NPC_ADDITIONAL_EQUIPMENT_SECTION_LABEL = 'Additional Equipment'
const QUICK_NPC_ADDITIONAL_EQUIPMENT_DESCRIPTION =
  'Add specific items this NPC should start with in addition to its package.'
const QUICK_NPC_STARTING_EQUIPMENT_ONLY_DESCRIPTION = 'Add the items this NPC should start with.'
const QUICK_NPC_STARTING_PACKAGE_DESCRIPTION =
  'Choose the class equipment package this NPC starts with.'
const QUICK_NPC_ADD_ITEM_PLACEHOLDER = '+ Add item'
const QUICK_NPC_EQUIPMENT_CATEGORY_FILTER_LABEL = 'Equipment category'

export type QuickNpcStartingEquipmentPanelProps = {
  setup: QuickNpcSetupValues
  choices: NpcStartingChoices
  buildContext: CharacterBuildContext
  additionalOptions: readonly QuickNpcAdditionalEquipmentOption[]
  excludedEquipmentIds: readonly string[]
}

function AdditionalEquipmentRow({
  entry,
  quantity,
  onRemove,
}: {
  entry: QuickNpcAdditionalEquipmentOption
  quantity: number
  onRemove: () => void
}) {
  const heading =
    quantity > 1 ? formatPackageInventoryRowTitle(entry.option.label, quantity) : entry.option.label
  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-card px-3 py-2">
      <div className="min-w-0 flex-1">
        <EntityAnatomyHost entity={{ heading }} density="compact" />
      </div>
      <ActionButton
        action="remove"
        variant="ghost"
        size="icon"
        density="compact"
        aria-label={`Remove ${entry.option.label}`}
        onClick={onRemove}
      />
    </div>
  )
}

function mergeNestedStartingChoiceOverrides(
  overrides: Record<string, string[]>,
  nestedSelections: Record<string, readonly string[]>,
): Record<string, string[]> {
  return {
    ...overrides,
    ...Object.fromEntries(
      Object.entries(nestedSelections).map(([key, value]) => [key, [...value]]),
    ),
  }
}

type QuickNpcStartingEquipmentPackageSectionProps = {
  packageContext: QuickNpcStartingEquipmentPackageContext
  overrides: Record<string, string[]>
  writeOverrides: (next: Record<string, string[]>) => void
}

function QuickNpcStartingEquipmentPackageSection({
  packageContext,
  overrides,
  writeOverrides,
}: QuickNpcStartingEquipmentPackageSectionProps) {
  const [isPackageChooserExpanded, setIsPackageChooserExpanded] = React.useState(false)
  const className = packageContext.characterClass?.name
  const startingChoiceSet = packageContext.resolvedChoiceSets.find(
    (choiceSet) => choiceSet.id === packageContext.startingEquipmentChoiceSetId,
  )
  const packageSelectedCount = packageContext.selectedOptionId ? 1 : 0
  const packageSelectionMax = startingChoiceSet?.max ?? 1

  return (
    <div className={quickNpcStartingChoiceInnerSectionClasses}>
      <QuickNpcStartingChoiceSubsectionHeader
        title={EQUIPMENT_STARTING_PACKAGE_SECTION_LABEL}
        selectionCounter={{
          selectedCount: packageSelectedCount,
          max: packageSelectionMax,
        }}
        subtitle={className ? `${className} class` : undefined}
        description={QUICK_NPC_STARTING_PACKAGE_DESCRIPTION}
      />
      <StartingEquipmentOptionSection
        characterClass={packageContext.characterClass!}
        catalogIndex={packageContext.catalogIndex}
        summaries={packageContext.summaries}
        draft={packageContext.draft}
        resolvedChoiceSets={packageContext.resolvedChoiceSets}
        selectedOptionId={packageContext.selectedOptionId}
        isPackageChooserExpanded={isPackageChooserExpanded}
        includeGoldOption={false}
        density="compact"
        onSelectOption={(optionId, nestedSelections) => {
          const choiceSetId = packageContext.startingEquipmentChoiceSetId
          if (!choiceSetId) return
          writeOverrides({
            ...mergeNestedStartingChoiceOverrides(overrides, nestedSelections),
            [choiceSetId]: [optionId],
          })
          setIsPackageChooserExpanded(false)
        }}
        onNestedPoolChange={(_optionId, choiceSetId, selection, nestedSelections) => {
          writeOverrides({
            ...mergeNestedStartingChoiceOverrides(overrides, nestedSelections),
            [choiceSetId]: [...selection],
          })
        }}
        onChoiceSelectionChange={(choiceSetId, selection) => {
          writeOverrides({
            ...overrides,
            [choiceSetId]: [...selection],
          })
        }}
        onChangePackage={() => setIsPackageChooserExpanded(true)}
        onCollapseChooser={() => setIsPackageChooserExpanded(false)}
      />
    </div>
  )
}

type QuickNpcAdditionalEquipmentSectionProps = {
  hasPackages: boolean
  equipmentSelections: QuickNpcEquipmentSelection[]
  additionalOptions: readonly QuickNpcAdditionalEquipmentOption[]
  excludedEquipmentIds: readonly string[]
  appendAdditionalEquipment: (equipmentId: string) => void
  removeAdditionalEquipment: (equipmentId: string) => void
}

function QuickNpcAdditionalEquipmentSection({
  hasPackages,
  equipmentSelections,
  additionalOptions,
  excludedEquipmentIds,
  appendAdditionalEquipment,
  removeAdditionalEquipment,
}: QuickNpcAdditionalEquipmentSectionProps) {
  const selectedIds = equipmentSelections.map((row) => row.equipmentId)
  const selectedAdditional = equipmentSelections.flatMap((selection) => {
    const entry = additionalOptions.find((option) => option.option.value === selection.equipmentId)
    return entry ? [{ entry, selection }] : []
  })

  const kindOptions = resolveQuickNpcAdditionalEquipmentKindOptions({
    entries: additionalOptions,
    selectedIds,
    excludedIds: excludedEquipmentIds,
  })

  const [selectedKind, setSelectedKind] = React.useState<(typeof kindOptions)[number] | undefined>(
    kindOptions[0],
  )

  React.useEffect(() => {
    if (kindOptions.length === 0) {
      setSelectedKind(undefined)
      return
    }
    if (!selectedKind || !kindOptions.includes(selectedKind)) {
      setSelectedKind(kindOptions[0])
    }
  }, [kindOptions, selectedKind])

  const comboboxOptions: ComboboxFieldOption[] = selectedKind
    ? filterQuickNpcAdditionalEquipmentByKind(
        additionalOptions,
        selectedKind,
        selectedIds,
        excludedEquipmentIds,
      ).map((entry) => entry.option)
    : []

  const addDisabled = kindOptions.length === 0
  const additionalTitle = hasPackages
    ? QUICK_NPC_ADDITIONAL_EQUIPMENT_SECTION_LABEL
    : EQUIPMENT_STARTING_PACKAGE_SECTION_LABEL
  const additionalDescription = hasPackages
    ? QUICK_NPC_ADDITIONAL_EQUIPMENT_DESCRIPTION
    : QUICK_NPC_STARTING_EQUIPMENT_ONLY_DESCRIPTION

  return (
    <div className={quickNpcStartingChoiceInnerSectionClasses}>
      <QuickNpcStartingChoiceSubsectionHeader
        title={additionalTitle}
        itemCountLabel={formatStartingChoiceItemCount(selectedAdditional.length)}
        description={additionalDescription}
      />
      {selectedAdditional.length > 0 ? (
        <ul className={quickNpcStartingChoiceSelectedListClasses}>
          {selectedAdditional.map(({ entry, selection }) => (
            <li key={selection.equipmentId}>
              <AdditionalEquipmentRow
                entry={entry}
                quantity={selection.quantity}
                onRemove={() => removeAdditionalEquipment(selection.equipmentId)}
              />
            </li>
          ))}
        </ul>
      ) : null}
      <div
        className={
          selectedAdditional.length > 0 ? quickNpcStartingChoiceAddControlClasses : undefined
        }
      >
        <ComboboxField
          id="quick-npc-additional-equipment"
          label="Add equipment"
          labelVisibility="srOnly"
          multiple={false}
          options={comboboxOptions}
          value=""
          disabled={addDisabled}
          onChange={(next) => {
            const value = Array.isArray(next) ? next[0] : next
            if (!value) return
            appendAdditionalEquipment(value)
          }}
          placeholder={QUICK_NPC_ADD_ITEM_PLACEHOLDER}
          emptyMessage="No matching items"
          filter={
            !addDisabled && selectedKind ? (
              <ComboboxFilterSelect
                ariaLabel={QUICK_NPC_EQUIPMENT_CATEGORY_FILTER_LABEL}
                value={selectedKind}
                options={kindOptions.map((kind) => ({
                  value: kind,
                  label: getEquipmentKindLabel(kind),
                }))}
                onValueChange={(next) => {
                  setSelectedKind(next as (typeof kindOptions)[number])
                }}
              />
            ) : undefined
          }
        />
      </div>
    </div>
  )
}

export function QuickNpcStartingEquipmentPanel({
  setup,
  choices,
  buildContext,
  additionalOptions,
  excludedEquipmentIds,
}: QuickNpcStartingEquipmentPanelProps) {
  const form = useFormContext<QuickNpcAuthoringTabFormValues>()
  const overrides = form.watch(QUICK_NPC_STARTING_CHOICE_OVERRIDES_FIELD_NAME) ?? {}
  const equipmentSelections = (form.watch(QUICK_NPC_EQUIPMENT_SELECTION_FIELD_NAME) ??
    []) as QuickNpcEquipmentSelection[]

  const packageContext = resolveQuickNpcStartingEquipmentPackageContext({
    setup,
    context: buildContext,
    choices,
  })

  function writeOverrides(next: Record<string, string[]>) {
    form.setValue(QUICK_NPC_STARTING_CHOICE_OVERRIDES_FIELD_NAME, next, { shouldDirty: true })
  }

  function appendAdditionalEquipment(equipmentId: string) {
    if (equipmentSelections.some((row) => row.equipmentId === equipmentId)) return
    form.setValue(
      QUICK_NPC_EQUIPMENT_SELECTION_FIELD_NAME,
      [...equipmentSelections, { equipmentId, quantity: 1, origin: 'manual' }],
      { shouldDirty: true },
    )
  }

  function removeAdditionalEquipment(equipmentId: string) {
    form.setValue(
      QUICK_NPC_EQUIPMENT_SELECTION_FIELD_NAME,
      equipmentSelections.filter((row) => row.equipmentId !== equipmentId),
      { shouldDirty: true },
    )
  }

  return (
    <>
      {packageContext ? (
        <QuickNpcStartingEquipmentPackageSection
          packageContext={packageContext}
          overrides={overrides}
          writeOverrides={writeOverrides}
        />
      ) : null}

      <QuickNpcAdditionalEquipmentSection
        hasPackages={packageContext !== null}
        equipmentSelections={equipmentSelections}
        additionalOptions={additionalOptions}
        excludedEquipmentIds={excludedEquipmentIds}
        appendAdditionalEquipment={appendAdditionalEquipment}
        removeAdditionalEquipment={removeAdditionalEquipment}
      />
    </>
  )
}
