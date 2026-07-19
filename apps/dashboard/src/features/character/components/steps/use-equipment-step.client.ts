'use client'

import { useEffect, useMemo, useState, type ComponentProps } from 'react'

import {
  buildEquipmentPackageSwitchPatch,
  buildStartingPackageConversionPatch,
  buildStartingPackageConversionPreview,
  createEquipmentPackageSwitchInventorySnapshot,
  equipmentPackageSwitchSnapshotsEqual,
  evaluateEquipmentPackageSwitch,
  indexCharacterBuildCatalog,
  initPackageSwitchDraftQuantities,
  rebuildPackageSwitchDraftQuantities,
  resolveBuilderStepReadiness,
  resolveStartingEquipmentOptionSummaries,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type ChoiceSet,
  type EquipmentPackageSwitchBlockingReason,
  type EquipmentPackageSwitchInventorySnapshot,
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
  readEquipmentPurchaseQuantity,
  resolveEquipmentStepBudget,
  resolveEquipmentStepPickerItems,
  resolvePurchaseSourceMode,
  resolveStartingGoldPurchaseId,
  shouldShowEquipmentBudget,
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

export type PendingEquipmentPackageSwitch = {
  targetOptionId: string
  nestedSelections: CharacterBuilderDraft['choiceSelections']
  draftQuantitiesByPurchaseId: Record<string, number>
  committedInventorySnapshot: EquipmentPackageSwitchInventorySnapshot
  commitErrorReason?: EquipmentPackageSwitchBlockingReason
  staleNotice?: boolean
}

export function useEquipmentStep(args: {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  resolvedChoiceSets: readonly ChoiceSet[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}) {
  const { context, draft, resolvedChoiceSets, onDraftChange } = args
  const [pendingSelection, setPendingSelection] = useState<PendingEquipmentSelection | null>(null)
  const [pendingPackageSwitch, setPendingPackageSwitch] =
    useState<PendingEquipmentPackageSwitch | null>(null)
  const [isPackageSwitchCommitting, setIsPackageSwitchCommitting] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [conversionEditorOpen, setConversionEditorOpen] = useState(false)
  const [selectedPackageItemKeys, setSelectedPackageItemKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const [conversionCommitStatusMessage, setConversionCommitStatusMessage] = useState<
    string | undefined
  >(undefined)
  const [isPackageChooserExpanded, setIsPackageChooserExpanded] = useState(false)

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
  const showBudget = shouldShowEquipmentBudget(draft, selectedOptionId)
  const showShopping = shouldShowEquipmentShopping(draft, selectedOptionId)
  const budget = useMemo(
    () => (showBudget ? resolveEquipmentStepBudget(draft, catalogIndex, context) : undefined),
    [catalogIndex, context, draft, showBudget],
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
      showBudget
        ? resolveEquipmentPickerCharacterPreviewContext({
            draft,
            catalogIndex,
            characterCreationRules: context.characterCreationRules,
            budget,
          })
        : undefined,
    [budget, catalogIndex, context.characterCreationRules, draft, showBudget],
  )
  const activePurchaseSourceMode = showBudget ? resolvePurchaseSourceMode() : undefined
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
    setIsPackageChooserExpanded(false)
  }

  const openPackageSwitchResolution = (
    optionId: string,
    nestedSelections: CharacterBuilderDraft['choiceSelections'],
  ) => {
    const evaluation = evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex,
      targetOptionId: optionId,
      nestedSelections,
    })

    if (!evaluation || evaluation.status === 'noConflict') return

    setPendingPackageSwitch({
      targetOptionId: optionId,
      nestedSelections,
      draftQuantitiesByPurchaseId: initPackageSwitchDraftQuantities(evaluation),
      committedInventorySnapshot: createEquipmentPackageSwitchInventorySnapshot(draft),
    })
  }

  const dismissPackageSwitch = () => {
    setPendingPackageSwitch(null)
    setIsPackageSwitchCommitting(false)
  }

  const handleDraftPackageSwitchQuantity = (purchaseId: string, quantity: number) => {
    setPendingPackageSwitch((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        draftQuantitiesByPurchaseId: {
          ...prev.draftQuantitiesByPurchaseId,
          [purchaseId]: quantity,
        },
        commitErrorReason: undefined,
        staleNotice: false,
      }
    })
  }

  const handleCommitPackageSwitch = () => {
    if (!pendingPackageSwitch || !startingEquipmentChoiceSet) return

    setIsPackageSwitchCommitting(true)

    const result = buildEquipmentPackageSwitchPatch({
      draft,
      catalogIndex,
      targetOptionId: pendingPackageSwitch.targetOptionId,
      choiceSetId: startingEquipmentChoiceSet.id,
      nestedSelections: pendingPackageSwitch.nestedSelections,
      draftQuantitiesByPurchaseId: pendingPackageSwitch.draftQuantitiesByPurchaseId,
      committedInventorySnapshot: pendingPackageSwitch.committedInventorySnapshot,
    })

    if (result.status === 'failure') {
      if (result.commitError.kind === 'staleCommittedInventory') {
        const evaluation = evaluateEquipmentPackageSwitch({
          draft,
          catalogIndex,
          targetOptionId: pendingPackageSwitch.targetOptionId,
          nestedSelections: pendingPackageSwitch.nestedSelections,
        })

        if (!evaluation) {
          dismissPackageSwitch()
          return
        }

        setPendingPackageSwitch({
          ...pendingPackageSwitch,
          committedInventorySnapshot: createEquipmentPackageSwitchInventorySnapshot(draft),
          draftQuantitiesByPurchaseId: rebuildPackageSwitchDraftQuantities({
            previousDraftQuantities: pendingPackageSwitch.draftQuantitiesByPurchaseId,
            evaluation,
          }),
          commitErrorReason: result.commitError,
          staleNotice: true,
        })
      } else {
        setPendingPackageSwitch({
          ...pendingPackageSwitch,
          commitErrorReason: result.commitError,
        })
      }

      setIsPackageSwitchCommitting(false)
      return
    }

    onDraftChange(result.patch)
    dismissPackageSwitch()
    setIsPackageChooserExpanded(false)
  }

  const packageSwitchEvaluation = useMemo(() => {
    if (!pendingPackageSwitch) return undefined

    return evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex,
      targetOptionId: pendingPackageSwitch.targetOptionId,
      nestedSelections: pendingPackageSwitch.nestedSelections,
      draftQuantitiesByPurchaseId: pendingPackageSwitch.draftQuantitiesByPurchaseId,
    })
  }, [catalogIndex, draft, pendingPackageSwitch])

  useEffect(() => {
    setPendingPackageSwitch((prev) => {
      if (!prev) return null

      const actualSnapshot = createEquipmentPackageSwitchInventorySnapshot(draft)
      if (equipmentPackageSwitchSnapshotsEqual(prev.committedInventorySnapshot, actualSnapshot)) {
        return prev
      }

      const evaluation = evaluateEquipmentPackageSwitch({
        draft,
        catalogIndex,
        targetOptionId: prev.targetOptionId,
        nestedSelections: prev.nestedSelections,
      })

      if (!evaluation) return null

      return {
        ...prev,
        committedInventorySnapshot: actualSnapshot,
        draftQuantitiesByPurchaseId: rebuildPackageSwitchDraftQuantities({
          previousDraftQuantities: prev.draftQuantitiesByPurchaseId,
          evaluation,
        }),
        staleNotice: true,
        commitErrorReason: undefined,
      }
    })
  }, [catalogIndex, draft])

  const requestSelection = (
    optionId: string,
    nestedSelections: CharacterBuilderDraft['choiceSelections'],
  ) => {
    if (!classId || !startingEquipmentChoiceSet) return
    if (optionId === selectedOptionId) {
      setIsPackageChooserExpanded(false)
      return
    }

    const nextSelection = { optionId, nestedSelections }
    const packageSwitchPreview = evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex,
      targetOptionId: optionId,
      nestedSelections,
    })

    if (packageSwitchPreview && packageSwitchPreview.status !== 'noConflict') {
      openPackageSwitchResolution(optionId, nestedSelections)
      return
    }

    if (draft.equipment?.customized) {
      setPendingSelection(nextSelection)
      return
    }

    applySelection(nextSelection)
  }

  const openPicker = () => {
    setPickerOpen(true)
  }

  const expandPackageChooser = () => {
    setIsPackageChooserExpanded(true)
  }

  const collapsePackageChooser = () => {
    setIsPackageChooserExpanded(false)
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
    if (!showBudget) return

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

  const handleRemoveFromInventory: ComponentProps<
    typeof EquipmentPickerDrawer
  >['onRemoveFromInventory'] = (item) => {
    const purchaseId = resolveStartingGoldPurchaseId(draft, item.equipment.id)
    if (!purchaseId) return

    onDraftChange(
      buildEquipmentRemoveEntryPatch({
        draft,
        target: { kind: 'purchase', purchaseId },
      }),
    )
  }

  const handleRemoveOneFromInventory: ComponentProps<
    typeof EquipmentPickerDrawer
  >['onRemoveOneFromInventory'] = (item) => {
    const equipmentId = item.equipment.id
    const purchaseId = resolveStartingGoldPurchaseId(draft, equipmentId)
    if (!purchaseId) return

    const sourceMode = resolvePurchaseSourceMode()
    const currentQuantity = readEquipmentPurchaseQuantity(draft, equipmentId, sourceMode)

    if (currentQuantity <= 1) {
      handleRemoveFromInventory(item)
      return
    }

    const patch = buildEquipmentSetPurchaseQuantityPatch({
      draft,
      catalogIndex,
      purchaseId,
      quantity: currentQuantity - 1,
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
    showBudget,
    showShopping,
    budget,
    pickerItems,
    pickerBrowseSortContext,
    characterPreviewContext,
    ownedPurchaseQuantities,
    pendingSelection,
    setPendingSelection,
    pendingPackageSwitch,
    packageSwitchEvaluation,
    dismissPackageSwitch,
    handleDraftPackageSwitchQuantity,
    handleCommitPackageSwitch,
    isPackageSwitchCommitting,
    pickerOpen,
    setPickerOpen,
    conversionEditorOpen,
    setConversionEditorOpen,
    selectedPackageItemKeys,
    setSelectedPackageItemKeys,
    conversionCommitStatusMessage,
    isPackageChooserExpanded,
    expandPackageChooser,
    collapsePackageChooser,
    openConversionEditor,
    handleCommitConversion,
    requestSelection,
    openPicker,
    handleAddItem,
    handleSetPurchaseQuantity,
    handleRemoveFromInventory,
    handleRemoveOneFromInventory,
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
