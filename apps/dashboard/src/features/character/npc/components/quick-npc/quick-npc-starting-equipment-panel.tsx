import * as React from 'react'
import { useFormContext } from 'react-hook-form'

import {
  getEquipmentKindLabel,
  getNpcTemplateLabel,
  indexCharacterBuildCatalog,
  type CharacterBuildContext,
  type NpcStartingChoices,
  type RecommendationSourceName,
} from '@rpg/contracts'
import {
  ActionButton,
  ComboboxField,
  ComboboxFilterSelect,
  type ComboboxFieldOption,
} from '@rpg/ui'

import { EquipmentOptionRow } from '@/features/character/components/equipment/picker/equipment-option-row'
import type { EquipmentOptionRowPresentation } from '@/features/character/lib/equipment/equipment-option-row-presentation.lib'
import { equipmentOptionQuantityAccessibleVariants } from '@/features/character/components/equipment/picker/equipment-option-row.variants'
import { StartingEquipmentOptionSection } from '@/features/character/components/equipment/starting-package/starting-equipment-option-section'
import { EQUIPMENT_STARTING_PACKAGE_SECTION_LABEL } from '@/features/character/lib/equipment/equipment-step.lib'

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
  buildQuickNpcAdditionalEquipmentPresentationMap,
  canAppendQuickNpcAdditionalEquipment,
  incrementQuickNpcManualEquipmentSelection,
  listSelectedQuickNpcAdditionalEquipment,
  quickNpcEquipmentOptionAccessibleLabel,
} from '../../lib/quick-npc/quick-npc-equipment-supply.lib'
import {
  formatManualEquipmentQuantityAccessibleLabel,
  formatManualEquipmentQuantityLabel,
} from '../../lib/quick-npc/quick-npc-equipment-presentation.lib'
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
  quickNpcAdditionalEquipmentQuantityClasses,
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
}

function equipmentRecommendationSourceName(
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
): RecommendationSourceName {
  return (source) => {
    if (source.kind === 'class') return catalogIndex.classes.get(source.id)?.name
    if (source.kind === 'species') return catalogIndex.species.get(source.id)?.name
    if (source.kind === 'role') return getNpcTemplateLabel(source.id)
    return undefined
  }
}

function AdditionalEquipmentRow({
  entry,
  manualQuantity,
  contextLabel,
  onRemove,
}: {
  entry: QuickNpcAdditionalEquipmentOption
  manualQuantity: number
  contextLabel?: string
  onRemove: () => void
}) {
  const manualLabel = formatManualEquipmentQuantityLabel(manualQuantity)
  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-card px-3 py-2">
      <div className="min-w-0 flex-1">
        <EntityAnatomyHost
          entity={{
            heading: entry.option.label,
            ...(contextLabel ? { description: contextLabel } : {}),
          }}
          density="compact"
        />
      </div>
      {manualLabel ? (
        <span className={quickNpcAdditionalEquipmentQuantityClasses}>
          <span aria-hidden="true">{manualLabel}</span>
          <span className={equipmentOptionQuantityAccessibleVariants()}>
            {formatManualEquipmentQuantityAccessibleLabel(manualQuantity)}
          </span>
        </span>
      ) : null}
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
  setup: QuickNpcSetupValues
  choices: NpcStartingChoices
  buildContext: CharacterBuildContext
  hasPackages: boolean
  equipmentSelections: QuickNpcEquipmentSelection[]
  additionalOptions: readonly QuickNpcAdditionalEquipmentOption[]
  appendAdditionalEquipment: (equipmentId: string) => void
  removeAdditionalEquipment: (equipmentId: string) => void
}

function additionalEquipmentSectionCopy(hasPackages: boolean) {
  if (hasPackages) {
    return {
      title: QUICK_NPC_ADDITIONAL_EQUIPMENT_SECTION_LABEL,
      description: QUICK_NPC_ADDITIONAL_EQUIPMENT_DESCRIPTION,
    }
  }
  return {
    title: EQUIPMENT_STARTING_PACKAGE_SECTION_LABEL,
    description: QUICK_NPC_STARTING_EQUIPMENT_ONLY_DESCRIPTION,
  }
}

function toAdditionalEquipmentComboboxOptions(
  entries: readonly QuickNpcAdditionalEquipmentOption[],
  presentationById: ReadonlyMap<string, EquipmentOptionRowPresentation>,
): ComboboxFieldOption[] {
  return entries.map((entry) => {
    const presentation = presentationById.get(entry.option.value)
    return {
      ...entry.option,
      disabled: presentation?.disabled === true,
      label: presentation
        ? quickNpcEquipmentOptionAccessibleLabel(presentation)
        : entry.option.label,
      metadata: presentation?.secondaryTitle,
    }
  })
}

function AdditionalEquipmentSelectedList({
  rows,
  onRemove,
}: {
  rows: ReturnType<typeof listSelectedQuickNpcAdditionalEquipment>
  onRemove: (equipmentId: string) => void
}) {
  if (rows.length === 0) return null
  return (
    <ul className={quickNpcStartingChoiceSelectedListClasses}>
      {rows.map(({ entry, equipmentId, manualQuantity, contextLabel }) => (
        <li key={equipmentId}>
          <AdditionalEquipmentRow
            entry={entry}
            manualQuantity={manualQuantity}
            {...(contextLabel ? { contextLabel } : {})}
            onRemove={() => onRemove(equipmentId)}
          />
        </li>
      ))}
    </ul>
  )
}

function AdditionalEquipmentPicker({
  options,
  presentationById,
  kindOptions,
  activeKind,
  disabled,
  onSelect,
  onKindChange,
}: {
  options: ComboboxFieldOption[]
  presentationById: ReadonlyMap<string, EquipmentOptionRowPresentation>
  kindOptions: ReturnType<typeof resolveQuickNpcAdditionalEquipmentKindOptions>
  activeKind: (typeof kindOptions)[number] | undefined
  disabled: boolean
  onSelect: (equipmentId: string) => void
  onKindChange: (kind: (typeof kindOptions)[number]) => void
}) {
  return (
    <ComboboxField
      id="quick-npc-additional-equipment"
      label="Add equipment"
      labelVisibility="srOnly"
      multiple={false}
      options={options}
      value=""
      disabled={disabled}
      renderOption={(option) => {
        const presentation = presentationById.get(option.value)
        return presentation ? <EquipmentOptionRow presentation={presentation} /> : option.label
      }}
      onChange={(next) => {
        const value = Array.isArray(next) ? next[0] : next
        if (!value) return
        onSelect(value)
      }}
      placeholder={QUICK_NPC_ADD_ITEM_PLACEHOLDER}
      emptyMessage="No matching items"
      filter={
        !disabled && activeKind ? (
          <ComboboxFilterSelect
            ariaLabel={QUICK_NPC_EQUIPMENT_CATEGORY_FILTER_LABEL}
            value={activeKind}
            options={kindOptions.map((kind) => ({
              value: kind,
              label: getEquipmentKindLabel(kind),
            }))}
            onValueChange={(next) => {
              onKindChange(next as (typeof kindOptions)[number])
            }}
          />
        ) : undefined
      }
    />
  )
}

function QuickNpcAdditionalEquipmentSection({
  setup,
  choices,
  buildContext,
  hasPackages,
  equipmentSelections,
  additionalOptions,
  appendAdditionalEquipment,
  removeAdditionalEquipment,
}: QuickNpcAdditionalEquipmentSectionProps) {
  const catalogIndex = React.useMemo(
    () => indexCharacterBuildCatalog(buildContext.catalog),
    [buildContext.catalog],
  )
  const sourceName = React.useMemo(
    () => equipmentRecommendationSourceName(catalogIndex),
    [catalogIndex],
  )
  const selectedAdditional = listSelectedQuickNpcAdditionalEquipment({
    equipmentSelections,
    additionalOptions,
    choices,
    catalogIndex,
    ...(setup.npcTemplateId ? { roleId: setup.npcTemplateId } : {}),
    ...(setup.classId ? { classId: setup.classId } : {}),
  })

  const kindOptions = resolveQuickNpcAdditionalEquipmentKindOptions(additionalOptions)

  const [selectedKind, setSelectedKind] = React.useState<(typeof kindOptions)[number] | undefined>(
    kindOptions[0],
  )
  const activeKind =
    selectedKind && kindOptions.includes(selectedKind) ? selectedKind : kindOptions[0]

  const visibleEntries = activeKind
    ? filterQuickNpcAdditionalEquipmentByKind(additionalOptions, activeKind)
    : []
  const presentationById = buildQuickNpcAdditionalEquipmentPresentationMap({
    entries: visibleEntries,
    equipmentSelections,
    choices,
    catalogIndex,
    setup,
    sourceName,
  })
  const comboboxOptions = toAdditionalEquipmentComboboxOptions(visibleEntries, presentationById)
  const addDisabled = kindOptions.length === 0
  const { title: additionalTitle, description: additionalDescription } =
    additionalEquipmentSectionCopy(hasPackages)

  return (
    <div className={quickNpcStartingChoiceInnerSectionClasses}>
      <QuickNpcStartingChoiceSubsectionHeader
        title={additionalTitle}
        itemCountLabel={formatStartingChoiceItemCount(selectedAdditional.length)}
        description={additionalDescription}
      />
      <AdditionalEquipmentSelectedList
        rows={selectedAdditional}
        onRemove={removeAdditionalEquipment}
      />
      <div
        className={
          selectedAdditional.length > 0 ? quickNpcStartingChoiceAddControlClasses : undefined
        }
      >
        <AdditionalEquipmentPicker
          options={comboboxOptions}
          presentationById={presentationById}
          kindOptions={kindOptions}
          activeKind={activeKind}
          disabled={addDisabled}
          onSelect={appendAdditionalEquipment}
          onKindChange={setSelectedKind}
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
    const entry = additionalOptions.find((option) => option.option.value === equipmentId)
    const catalogIndex = indexCharacterBuildCatalog(buildContext.catalog)
    if (
      !canAppendQuickNpcAdditionalEquipment({
        entry,
        equipmentSelections,
        choices,
        catalogIndex,
        setup,
      })
    ) {
      return
    }
    form.setValue(
      QUICK_NPC_EQUIPMENT_SELECTION_FIELD_NAME,
      incrementQuickNpcManualEquipmentSelection({ equipmentSelections, equipmentId }),
      { shouldDirty: true },
    )
  }

  function removeAdditionalEquipment(equipmentId: string) {
    const hasManual = equipmentSelections.some(
      (row) => row.equipmentId === equipmentId && row.origin === 'manual',
    )
    form.setValue(
      QUICK_NPC_EQUIPMENT_SELECTION_FIELD_NAME,
      equipmentSelections.filter((row) => {
        if (row.equipmentId !== equipmentId) return true
        return hasManual ? row.origin !== 'manual' : false
      }),
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
        setup={setup}
        choices={choices}
        buildContext={buildContext}
        hasPackages={packageContext !== null}
        equipmentSelections={equipmentSelections}
        additionalOptions={additionalOptions}
        appendAdditionalEquipment={appendAdditionalEquipment}
        removeAdditionalEquipment={removeAdditionalEquipment}
      />
    </>
  )
}
