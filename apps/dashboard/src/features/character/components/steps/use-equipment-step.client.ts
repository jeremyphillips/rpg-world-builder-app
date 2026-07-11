'use client'

import { useMemo, useState, type ComponentProps } from 'react'

import {
  buildStartingPackageConversionPatch,
  buildStartingPackageConversionPreview,
  indexCharacterBuildCatalog,
  resolveBuilderStepReadiness,
  resolveStartingEquipmentOptionSummaries,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type ChoiceSet,
  type StartingPackageConversionPreview,
} from '@rpg/contracts'

import {
  buildEquipmentAddPurchasePatch,
  buildEquipmentRemoveEntryPatch,
  buildEquipmentSelectionPatch,
  buildEquipmentSetPurchaseQuantityPatch,
  choiceSetsForEquipmentStep,
  findStartingEquipmentChoiceSet,
  hasGoldStartingEquipmentOption,
  readSelectedStartingEquipmentOption,
  resolveEquipmentStepBudget,
  resolveEquipmentStepPickerItems,
  resolvePurchaseSourceMode,
  shouldShowEquipmentFallback,
  shouldShowEquipmentShopping,
} from '../../lib/equipment-step.lib'
import { withChoiceSetSelections } from '../../lib/choice-set-selections'
import { resolveEquipmentPickerCharacterPreviewContext } from '../equipment/equipment-picker-character-preview.lib'
import type { EquipmentPickerDrawer } from '../equipment/equipment-picker-drawer.client'
import type { EquipmentStepInventorySectionProps } from './equipment-step-sections.client'

type PendingEquipmentSelection = {
  optionId: string
  nestedSelections: CharacterBuilderDraft['choiceSelections']
}

export function useEquipmentStep(args: {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}) {
  const { context, draft, resolvedChoiceSets, onDraftChange } = args
  const [pendingSelection, setPendingSelection] = useState<PendingEquipmentSelection | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [conversionEditorOpen, setConversionEditorOpen] = useState(false)
  const [selectedPackageItemKeys, setSelectedPackageItemKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const [conversionCommitStatusMessage, setConversionCommitStatusMessage] = useState<
    string | undefined
  >(undefined)

  const classId = draft.class.classId
  const catalogIndex = useMemo(() => indexCharacterBuildCatalog(context.catalog), [context.catalog])
  const characterClass = classId ? catalogIndex.classes.get(classId) : undefined
  const equipmentChoiceSets = useMemo(
    () => choiceSetsForEquipmentStep(resolvedChoiceSets),
    [resolvedChoiceSets],
  )
  const readiness = useMemo(
    () => resolveBuilderStepReadiness('equipment', draft, context, resolvedChoiceSets),
    [context, draft, resolvedChoiceSets],
  )
  const startingEquipmentChoiceSet = classId
    ? findStartingEquipmentChoiceSet(resolvedChoiceSets, classId)
    : undefined
  const summaries = useMemo(
    () =>
      characterClass
        ? resolveStartingEquipmentOptionSummaries(characterClass, catalogIndex, draft)
        : [],
    [catalogIndex, characterClass, draft],
  )
  const selectedOptionId = readSelectedStartingEquipmentOption(draft, classId)
  const showFallback =
    shouldShowEquipmentFallback(summaries) && !hasGoldStartingEquipmentOption(summaries)
  const showShopping = shouldShowEquipmentShopping(draft, selectedOptionId)
  const budget = useMemo(
    () => (showShopping ? resolveEquipmentStepBudget(draft, catalogIndex) : undefined),
    [catalogIndex, draft, showShopping],
  )
  const { items: pickerItems, browseSortContext: pickerBrowseSortContext } = useMemo(
    () =>
      characterClass
        ? resolveEquipmentStepPickerItems({
            draft,
            characterClass,
            catalogIndex,
            choiceSets: resolvedChoiceSets,
          })
        : { items: [], browseSortContext: { preferMartialWeaponBrowseOrder: false } },
    [catalogIndex, characterClass, draft, resolvedChoiceSets],
  )
  const characterPreviewContext = useMemo(
    () =>
      showShopping
        ? resolveEquipmentPickerCharacterPreviewContext({
            draft,
            catalogIndex,
            characterCreationRules: context.characterCreationRules,
            budget,
          })
        : undefined,
    [budget, catalogIndex, context.characterCreationRules, draft, showShopping],
  )
  const activePurchaseSourceMode = showShopping ? resolvePurchaseSourceMode() : undefined
  const ownedPurchaseQuantities = useMemo(() => {
    if (!activePurchaseSourceMode) return {}

    const quantities: Record<string, number> = {}
    for (const purchase of draft.equipment?.purchases ?? []) {
      if (purchase.sourceMode === activePurchaseSourceMode) {
        quantities[purchase.equipmentId] = purchase.quantity
      }
    }
    return quantities
  }, [activePurchaseSourceMode, draft.equipment?.purchases])

  const applySelection = (selection: PendingEquipmentSelection) => {
    if (!classId || !startingEquipmentChoiceSet) return

    onDraftChange(
      buildEquipmentSelectionPatch({
        draft,
        classId,
        optionId: selection.optionId,
        choiceSetId: startingEquipmentChoiceSet.id,
        nestedSelections: selection.nestedSelections,
      }),
    )
  }

  const requestSelection = (
    optionId: string,
    nestedSelections: CharacterBuilderDraft['choiceSelections'],
  ) => {
    if (!classId || !startingEquipmentChoiceSet) return
    if (optionId === selectedOptionId) return

    const nextSelection = { optionId, nestedSelections }
    if (draft.equipment?.customized) {
      setPendingSelection(nextSelection)
      return
    }

    applySelection(nextSelection)
  }

  const openPicker = () => {
    setPickerOpen(true)
  }

  const defaultSelectedPackageItemKeys = (deselectedKeys: ReadonlySet<string> = new Set()) => {
    if (!selectedOptionId) return new Set<string>()

    const preview = buildStartingPackageConversionPreview({
      draft,
      catalogIndex,
      departingOptionId: selectedOptionId,
      selectedPackageItemKeys: new Set(),
    })

    if (!preview) return new Set<string>()

    return new Set(
      preview.items
        .filter((item) => item.status === 'selectable' && !deselectedKeys.has(item.packageItemKey))
        .map((item) => item.packageItemKey),
    )
  }

  const openConversionEditor = (deselectedKeys: ReadonlySet<string> = new Set()) => {
    setConversionCommitStatusMessage(undefined)
    setSelectedPackageItemKeys(defaultSelectedPackageItemKeys(deselectedKeys))
    setConversionEditorOpen(true)
  }

  const handleCommitConversion = (_preview: StartingPackageConversionPreview) => {
    if (!selectedOptionId) return

    const patch = buildStartingPackageConversionPatch({
      draft,
      catalogIndex,
      departingOptionId: selectedOptionId,
      selectedPackageItemKeys,
    })

    if (!patch) return

    onDraftChange(patch)
    setConversionEditorOpen(false)
    setConversionCommitStatusMessage('Starting equipment converted to starting gold.')
  }

  const handleAddItem: ComponentProps<typeof EquipmentPickerDrawer>['onAddItem'] = (
    item,
    quantity,
  ) => {
    if (!showShopping) return

    const patch = buildEquipmentAddPurchasePatch({
      draft,
      catalogIndex,
      equipmentId: item.equipment.id,
      sourceMode: resolvePurchaseSourceMode(),
      quantity,
    })
    if (patch) onDraftChange(patch)
  }

  const handleSetPurchaseQuantity = (
    target: Parameters<NonNullable<EquipmentStepInventorySectionProps['onSetPurchaseQuantity']>>[0],
    quantity: number,
  ) => {
    const patch = buildEquipmentSetPurchaseQuantityPatch({
      draft,
      catalogIndex,
      purchaseId: target.purchaseId,
      quantity,
    })
    if (patch) onDraftChange(patch)
  }

  return {
    catalogIndex,
    characterClass,
    classId,
    equipmentChoiceSets,
    resolvedChoiceSets,
    summaries,
    selectedOptionId,
    showFallback,
    showShopping,
    budget,
    pickerItems,
    pickerBrowseSortContext,
    characterPreviewContext,
    ownedPurchaseQuantities,
    pendingSelection,
    setPendingSelection,
    pickerOpen,
    setPickerOpen,
    conversionEditorOpen,
    setConversionEditorOpen,
    selectedPackageItemKeys,
    setSelectedPackageItemKeys,
    conversionCommitStatusMessage,
    openConversionEditor,
    handleCommitConversion,
    requestSelection,
    openPicker,
    handleAddItem,
    handleSetPurchaseQuantity,
    applySelection,
    onRemoveItem: (target: Parameters<typeof buildEquipmentRemoveEntryPatch>[0]['target']) =>
      onDraftChange(buildEquipmentRemoveEntryPatch({ draft, target })),
    onNestedPoolChange: (
      optionId: string,
      choiceSetId: string,
      selection: string[],
      nestedSelections: CharacterBuilderDraft['choiceSelections'],
    ) => {
      if (selectedOptionId !== optionId) return

      onDraftChange({
        choiceSelections: {
          ...draft.choiceSelections,
          ...nestedSelections,
          [choiceSetId]: selection,
        },
      })
    },
    onChoiceSelectionChange: (choiceSetId: string, selection: readonly string[]) => {
      onDraftChange({
        choiceSelections: withChoiceSetSelections(draft, choiceSetId, [...selection]),
      })
    },
    readiness,
  }
}
