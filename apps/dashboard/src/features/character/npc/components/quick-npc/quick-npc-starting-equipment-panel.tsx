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
import { declineClassPackage, selectClassPackage, type ClassPackageChoice } from '@rpg/contracts'
import {
  ActionButton,
  Button,
  ComboboxField,
  ComboboxFilterSelect,
  ConfirmDialog,
  RowActionsMenu,
  SelectionOptionCardHeaderAction,
  SelectionOptionCardTitleMeta,
  type ComboboxFieldOption,
  type RowActionMenuItem,
} from '@rpg/ui'

import { EquipmentOptionRow } from '@/features/character/components/equipment/picker/equipment-option-row'
import type { EquipmentOptionRowPresentation } from '@/features/character/lib/equipment/equipment-option-row-presentation.lib'
import { equipmentOptionQuantityAccessibleVariants } from '@/features/character/components/equipment/picker/equipment-option-row.variants'
import { StartingEquipmentOptionCards } from '@/features/character/components/equipment/starting-package/starting-equipment-option-cards'
import { StartingEquipmentOptionSummaryCard } from '@/features/character/components/equipment/starting-package/starting-equipment-option-summary'
import {
  EQUIPMENT_CHANGE_PACKAGE_LABEL,
  EQUIPMENT_STARTING_PACKAGE_SECTION_LABEL,
  filterPackageStartingEquipmentSummaries,
} from '@/features/character/lib/equipment/equipment-step.lib'

import { EntityAnatomyHost } from '@/features/content'

import {
  filterQuickNpcAdditionalEquipmentByKind,
  resolveQuickNpcAdditionalEquipmentKindOptions,
  type QuickNpcAdditionalEquipmentOption,
} from '../../lib/quick-npc/quick-npc-additional-equipment.lib'
import {
  QUICK_NPC_CLASS_PACKAGE_FIELD_NAME,
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
  buildQuickNpcPackageCustomizationRows,
  formatQuickNpcEffectivePackageDescription,
  formatQuickNpcPackageWealthLabel,
  QUICK_NPC_CANCEL_LABEL,
  QUICK_NPC_CHOOSE_PACKAGE_LABEL,
  QUICK_NPC_CUSTOMIZE_PACKAGE_LABEL,
  QUICK_NPC_DECLINED_ADDITIONAL_EQUIPMENT_DESCRIPTION,
  QUICK_NPC_EDIT_CUSTOMIZATION_LABEL,
  QUICK_NPC_NO_STARTING_PACKAGE_BODY,
  QUICK_NPC_NO_STARTING_PACKAGE_HEADING,
  QUICK_NPC_PACKAGE_ACTIONS_LABEL,
  QUICK_NPC_PACKAGE_CUSTOMIZED_LABEL,
  QUICK_NPC_PACKAGE_SECTION_DESCRIPTION,
  QUICK_NPC_REMOVE_PACKAGE_LABEL,
  QUICK_NPC_RESTORE_PACKAGE_DEFAULTS_LABEL,
  quickNpcCanChangePackage,
  quickNpcPackageDraftIsDirty,
  quickNpcPackageDraftQuantities,
  quickNpcUsePackageLabel,
  removeQuickNpcPackageDraftEntry,
  readQuickNpcClassPackage,
  resolveQuickNpcEffectiveClassPackage,
  restoreQuickNpcPackageDraftEntry,
  saveQuickNpcPackageCustomization,
  selectQuickNpcClassPackage,
  setQuickNpcPackageDraftQuantity,
  quickNpcPackageIsCustomized,
} from '../../lib/quick-npc/quick-npc-package-customization.lib'
import {
  formatStartingChoiceItemCount,
  resolveQuickNpcStartingEquipmentPackageContext,
} from '../../lib/quick-npc/quick-npc-starting-equipment.lib'
import { useQuickNpcEditingLock } from './quick-npc-editing-lock'
import { QuickNpcPackageCustomizationPanel } from './quick-npc-package-customization-panel'
import {
  quickNpcPackageHeaderActionsClasses,
  quickNpcPackageNoPackageClasses,
} from './quick-npc-package-customization.variants'
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

function dropPackageChoiceOverride(
  overrides: Record<string, string[]>,
  choiceSetId: string | undefined,
): Record<string, string[]> {
  if (!choiceSetId) return overrides
  const next = { ...overrides }
  delete next[choiceSetId]
  return next
}

// fallow-ignore-next-line complexity
function QuickNpcStartingEquipmentPackageSection({
  packageContext,
  setup,
  buildContext,
  overrides,
  formChoice,
  writeOverrides,
  writeClassPackage,
}: QuickNpcStartingEquipmentPackageSectionProps & {
  setup: QuickNpcSetupValues
  buildContext: CharacterBuildContext
  formChoice: ClassPackageChoice
  writeClassPackage: (next: ClassPackageChoice) => void
}) {
  const { register: registerEditingLock } = useQuickNpcEditingLock()
  const saveButtonRef = React.useRef<HTMLButtonElement>(null)
  const [showLockMessage, setShowLockMessage] = React.useState(false)
  const [isPackageChooserExpanded, setIsPackageChooserExpanded] = React.useState(false)
  const [chooserFromDeclined, setChooserFromDeclined] = React.useState(false)
  const [disclosureOpen, setDisclosureOpen] = React.useState(false)
  const [confirm, setConfirm] = React.useState<'change' | 'remove' | 'restore' | null>(null)
  const [pendingPackageId, setPendingPackageId] = React.useState<string | undefined>()
  const submittedQuantities = quickNpcPackageDraftQuantities(formChoice)
  const [draftQuantities, setDraftQuantities] = React.useState(submittedQuantities)

  const effective = resolveQuickNpcEffectiveClassPackage({
    formChoice,
    draft: packageContext.draft,
    setup,
    context: buildContext,
  })
  const selectedOption =
    effective.state === 'selected'
      ? packageContext.characterClass?.characterCreation?.startingEquipment?.options.find(
          (option) => option.id === effective.packageId,
        )
      : undefined
  const selectedSummary = packageContext.summaries.find(
    (summary) => summary.optionId === selectedOption?.id,
  )
  const rows =
    selectedOption && selectedSummary
      ? buildQuickNpcPackageCustomizationRows({
          option: selectedOption,
          orderedItems: selectedSummary.orderedItems,
          entryQuantities: disclosureOpen ? draftQuantities : submittedQuantities,
        })
      : []
  const description =
    selectedOption && selectedSummary
      ? formatQuickNpcEffectivePackageDescription({
          option: selectedOption,
          orderedItems: selectedSummary.orderedItems,
          entryQuantities: disclosureOpen
            ? quickNpcPackageDraftQuantities(formChoice)
            : submittedQuantities,
        })
      : selectedSummary?.description
  const wealthLabel = formatQuickNpcPackageWealthLabel(selectedOption)
  const customized = quickNpcPackageIsCustomized(formChoice)
  const canChangePackage =
    packageContext.characterClass !== undefined &&
    quickNpcCanChangePackage({
      characterClass: packageContext.characterClass,
      summaries: packageContext.summaries,
    })
  const dirty = quickNpcPackageDraftIsDirty(draftQuantities, submittedQuantities)
  const packageSummaries = packageContext.characterClass
    ? filterPackageStartingEquipmentSummaries(
        packageContext.characterClass,
        packageContext.summaries,
      )
    : []
  const onlyPackage = packageSummaries.length === 1 ? packageSummaries[0] : undefined

  React.useEffect(() => {
    if (!disclosureOpen || !dirty) {
      registerEditingLock(null)
      return
    }
    registerEditingLock({
      requestFocus: () => {
        setShowLockMessage(true)
        saveButtonRef.current?.focus()
      },
    })
    return () => registerEditingLock(null)
  }, [dirty, disclosureOpen, registerEditingLock])

  if (effective.state === 'unavailable' || !packageContext.characterClass) return null

  function writeExplicitPackage(
    packageId: string,
    nestedSelections: Record<string, readonly string[]>,
  ) {
    writeClassPackage(selectClassPackage(packageId, 'explicit'))
    writeOverrides(
      dropPackageChoiceOverride(
        mergeNestedStartingChoiceOverrides(overrides, nestedSelections),
        packageContext.startingEquipmentChoiceSetId,
      ),
    )
    setDisclosureOpen(false)
    setIsPackageChooserExpanded(false)
    setChooserFromDeclined(false)
    setDraftQuantities({})
  }

  function requestPackageChange(
    packageId: string,
    nestedSelections: Record<string, readonly string[]>,
  ) {
    if (customized && effective.state === 'selected' && effective.packageId !== packageId) {
      setPendingPackageId(packageId)
      setConfirm('change')
      return
    }
    writeExplicitPackage(packageId, nestedSelections)
  }

  function openDisclosure() {
    if (effective.state === 'selected' && formChoice.state !== 'selected') {
      writeClassPackage(selectQuickNpcClassPackage(effective.packageId))
    }
    const quantities = quickNpcPackageDraftQuantities(
      effective.state === 'selected' && formChoice.state === 'selected'
        ? formChoice
        : { state: 'unresolved' },
    )
    setDraftQuantities(quantities)
    setShowLockMessage(false)
    setDisclosureOpen(true)
    setIsPackageChooserExpanded(false)
  }

  const menuItems: RowActionMenuItem[] = customized
    ? [
        {
          kind: 'action',
          id: 'edit',
          label: QUICK_NPC_EDIT_CUSTOMIZATION_LABEL,
          onSelect: openDisclosure,
        },
        {
          kind: 'action',
          id: 'restore',
          label: QUICK_NPC_RESTORE_PACKAGE_DEFAULTS_LABEL,
          onSelect: () => setConfirm('restore'),
        },
        {
          kind: 'action',
          id: 'remove',
          label: QUICK_NPC_REMOVE_PACKAGE_LABEL,
          destructive: true,
          separatorBefore: true,
          onSelect: () => setConfirm('remove'),
        },
      ]
    : [
        {
          kind: 'action',
          id: 'customize',
          label: QUICK_NPC_CUSTOMIZE_PACKAGE_LABEL,
          onSelect: openDisclosure,
        },
        {
          kind: 'action',
          id: 'remove',
          label: QUICK_NPC_REMOVE_PACKAGE_LABEL,
          destructive: true,
          separatorBefore: true,
          onSelect: () => writeClassPackage(declineClassPackage()),
        },
      ]

  const currentLabel = selectedSummary?.label ?? 'this package'
  const nextLabel =
    packageSummaries.find((summary) => summary.optionId === pendingPackageId)?.label ??
    'the next package'

  return (
    <div className={quickNpcStartingChoiceInnerSectionClasses}>
      <QuickNpcStartingChoiceSubsectionHeader
        title={EQUIPMENT_STARTING_PACKAGE_SECTION_LABEL}
        subtitle={
          packageContext.characterClass.name
            ? `${packageContext.characterClass.name} class`
            : undefined
        }
        description={QUICK_NPC_PACKAGE_SECTION_DESCRIPTION}
      />
      {effective.state === 'selected' && selectedSummary && !isPackageChooserExpanded ? (
        <StartingEquipmentOptionSummaryCard
          summary={selectedSummary}
          density="compact"
          onChangePackage={() => {
            setChooserFromDeclined(false)
            setIsPackageChooserExpanded(true)
          }}
          description={description}
          titleAdornment={
            customized && !disclosureOpen ? (
              <SelectionOptionCardTitleMeta>
                {QUICK_NPC_PACKAGE_CUSTOMIZED_LABEL}
              </SelectionOptionCardTitleMeta>
            ) : undefined
          }
          headerEndSlot={
            disclosureOpen ? null : (
              <span className={quickNpcPackageHeaderActionsClasses}>
                {canChangePackage ? (
                  <SelectionOptionCardHeaderAction
                    label={EQUIPMENT_CHANGE_PACKAGE_LABEL}
                    density="compact"
                    onClick={() => {
                      setChooserFromDeclined(false)
                      setIsPackageChooserExpanded(true)
                    }}
                  />
                ) : null}
                <RowActionsMenu
                  triggerLabel={QUICK_NPC_PACKAGE_ACTIONS_LABEL}
                  triggerSize="compact"
                  items={menuItems}
                />
              </span>
            )
          }
          embedded={
            disclosureOpen ? (
              <QuickNpcPackageCustomizationPanel
                packageLabel={selectedSummary.label}
                rows={rows}
                {...(wealthLabel ? { wealthLabel } : {})}
                draftQuantities={draftQuantities}
                submittedQuantities={submittedQuantities}
                showLockMessage={showLockMessage}
                saveButtonRef={saveButtonRef}
                onChangeQuantity={(entryId, packageQuantity, quantity) =>
                  setDraftQuantities((current) =>
                    setQuickNpcPackageDraftQuantity({
                      entryId,
                      packageQuantity,
                      quantity,
                      entryQuantities: current,
                    }),
                  )
                }
                onRemove={(entryId, packageQuantity) =>
                  setDraftQuantities((current) =>
                    removeQuickNpcPackageDraftEntry({
                      entryId,
                      packageQuantity,
                      entryQuantities: current,
                    }),
                  )
                }
                onRestore={(entryId) =>
                  setDraftQuantities((current) =>
                    restoreQuickNpcPackageDraftEntry({ entryId, entryQuantities: current }),
                  )
                }
                onRestoreAll={() => setDraftQuantities({})}
                onCancel={() => {
                  setDraftQuantities(submittedQuantities)
                  setDisclosureOpen(false)
                  setShowLockMessage(false)
                }}
                onSave={() => {
                  if (!selectedOption) return
                  writeClassPackage(
                    saveQuickNpcPackageCustomization({
                      packageId: selectedOption.id,
                      entryQuantities: draftQuantities,
                      option: selectedOption,
                    }),
                  )
                  setDisclosureOpen(false)
                  setShowLockMessage(false)
                }}
              />
            ) : undefined
          }
          embeddedTone="panel"
        />
      ) : null}
      {effective.state === 'declined' && !isPackageChooserExpanded ? (
        <div className={quickNpcPackageNoPackageClasses}>
          <p className="text-sm font-body-emphasis">{QUICK_NPC_NO_STARTING_PACKAGE_HEADING}</p>
          <p className="text-xs text-muted-foreground">{QUICK_NPC_NO_STARTING_PACKAGE_BODY}</p>
          <Button
            type="button"
            size="xs"
            density="compact"
            onClick={() => {
              if (onlyPackage) {
                writeExplicitPackage(onlyPackage.optionId, {})
                return
              }
              setChooserFromDeclined(true)
              setIsPackageChooserExpanded(true)
            }}
          >
            {onlyPackage
              ? quickNpcUsePackageLabel(onlyPackage.label)
              : QUICK_NPC_CHOOSE_PACKAGE_LABEL}
          </Button>
        </div>
      ) : null}
      {isPackageChooserExpanded || effective.state === 'unresolved' ? (
        <>
          <StartingEquipmentOptionCards
            characterClass={packageContext.characterClass}
            catalogIndex={packageContext.catalogIndex}
            summaries={packageSummaries}
            draft={packageContext.draft}
            resolvedChoiceSets={packageContext.resolvedChoiceSets}
            {...(effective.state === 'selected' ? { selectedOptionId: effective.packageId } : {})}
            isPackageChooserExpanded={isPackageChooserExpanded || effective.state === 'unresolved'}
            includeGoldOption={false}
            density="compact"
            onSelectOption={(optionId, nestedSelections) =>
              requestPackageChange(optionId, nestedSelections)
            }
            onNestedPoolChange={(_optionId, choiceSetId, selection, nestedSelections) => {
              writeOverrides({
                ...mergeNestedStartingChoiceOverrides(overrides, nestedSelections),
                [choiceSetId]: [...selection],
              })
            }}
            onChoiceSelectionChange={(choiceSetId, selection) => {
              writeOverrides({ ...overrides, [choiceSetId]: [...selection] })
            }}
            onCollapseChooser={() => {
              setIsPackageChooserExpanded(false)
              setChooserFromDeclined(false)
            }}
          />
          {chooserFromDeclined ? (
            <Button
              type="button"
              variant="text"
              size="xs"
              density="compact"
              onClick={() => {
                setIsPackageChooserExpanded(false)
                setChooserFromDeclined(false)
              }}
            >
              {QUICK_NPC_CANCEL_LABEL}
            </Button>
          ) : null}
        </>
      ) : null}
      <ConfirmDialog
        open={confirm === 'change'}
        onOpenChange={(open) => {
          if (!open) setConfirm(null)
        }}
        headline="Change package?"
        description={`Your customization of ${currentLabel} will be discarded. ${nextLabel} starts with its default items. Additional Equipment isn't affected.`}
        confirmLabel={EQUIPMENT_CHANGE_PACKAGE_LABEL}
        cancelLabel={QUICK_NPC_CANCEL_LABEL}
        confirmVariant="warning"
        onConfirm={() => {
          if (pendingPackageId) writeExplicitPackage(pendingPackageId, {})
          setConfirm(null)
        }}
      />
      <ConfirmDialog
        open={confirm === 'remove'}
        onOpenChange={(open) => {
          if (!open) setConfirm(null)
        }}
        headline="Remove package?"
        description={`${currentLabel} and your customization will be removed. Additional Equipment isn't affected.`}
        confirmLabel={QUICK_NPC_REMOVE_PACKAGE_LABEL}
        cancelLabel={QUICK_NPC_CANCEL_LABEL}
        confirmVariant="destructive"
        onConfirm={() => {
          writeClassPackage(declineClassPackage())
          setDisclosureOpen(false)
          setConfirm(null)
        }}
      />
      <ConfirmDialog
        open={confirm === 'restore'}
        onOpenChange={(open) => {
          if (!open) setConfirm(null)
        }}
        headline="Restore package defaults?"
        description={`Your customization of ${currentLabel} will be discarded and every item returns to its package quantity.`}
        confirmLabel="Restore defaults"
        cancelLabel={QUICK_NPC_CANCEL_LABEL}
        confirmVariant="warning"
        onConfirm={() => {
          if (effective.state === 'selected') {
            writeClassPackage(selectQuickNpcClassPackage(effective.packageId))
          }
          setDraftQuantities({})
          setConfirm(null)
        }}
      />
    </div>
  )
}

type QuickNpcAdditionalEquipmentSectionProps = {
  setup: QuickNpcSetupValues
  choices: NpcStartingChoices
  buildContext: CharacterBuildContext
  equipmentMode: 'package' | 'declined' | 'none'
  equipmentSelections: QuickNpcEquipmentSelection[]
  additionalOptions: readonly QuickNpcAdditionalEquipmentOption[]
  appendAdditionalEquipment: (equipmentId: string) => void
  removeAdditionalEquipment: (equipmentId: string) => void
}

function additionalEquipmentSectionCopy(mode: 'package' | 'declined' | 'none') {
  if (mode === 'package') {
    return {
      title: QUICK_NPC_ADDITIONAL_EQUIPMENT_SECTION_LABEL,
      description: QUICK_NPC_ADDITIONAL_EQUIPMENT_DESCRIPTION,
    }
  }
  if (mode === 'declined') {
    return {
      title: QUICK_NPC_ADDITIONAL_EQUIPMENT_SECTION_LABEL,
      description: QUICK_NPC_DECLINED_ADDITIONAL_EQUIPMENT_DESCRIPTION,
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
  equipmentMode,
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
    additionalEquipmentSectionCopy(equipmentMode)

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
  const formChoice = readQuickNpcClassPackage(form.watch(QUICK_NPC_CLASS_PACKAGE_FIELD_NAME))
  const equipmentSelections = (form.watch(QUICK_NPC_EQUIPMENT_SELECTION_FIELD_NAME) ??
    []) as QuickNpcEquipmentSelection[]

  const packageContext = resolveQuickNpcStartingEquipmentPackageContext({
    setup,
    context: buildContext,
    choices,
  })
  const effective = packageContext
    ? resolveQuickNpcEffectiveClassPackage({
        formChoice,
        draft: packageContext.draft,
        setup,
        context: buildContext,
      })
    : { state: 'unavailable' as const }
  const equipmentMode =
    effective.state === 'declined'
      ? 'declined'
      : effective.state === 'unavailable' || !packageContext
        ? 'none'
        : 'package'

  function writeOverrides(next: Record<string, string[]>) {
    form.setValue(QUICK_NPC_STARTING_CHOICE_OVERRIDES_FIELD_NAME, next, { shouldDirty: true })
  }

  function writeClassPackage(next: ClassPackageChoice) {
    form.setValue(QUICK_NPC_CLASS_PACKAGE_FIELD_NAME, next, { shouldDirty: true })
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
      {packageContext && effective.state !== 'unavailable' ? (
        <QuickNpcStartingEquipmentPackageSection
          packageContext={packageContext}
          setup={setup}
          buildContext={buildContext}
          overrides={overrides}
          formChoice={formChoice}
          writeOverrides={writeOverrides}
          writeClassPackage={writeClassPackage}
        />
      ) : null}

      <QuickNpcAdditionalEquipmentSection
        setup={setup}
        choices={choices}
        buildContext={buildContext}
        equipmentMode={equipmentMode}
        equipmentSelections={equipmentSelections}
        additionalOptions={additionalOptions}
        appendAdditionalEquipment={appendAdditionalEquipment}
        removeAdditionalEquipment={removeAdditionalEquipment}
      />
    </>
  )
}
