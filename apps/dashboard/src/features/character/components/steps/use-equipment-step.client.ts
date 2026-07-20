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
  isStartingGoldOption,
  rebuildPackageSwitchDraftQuantities,
  resolveBuilderStepReadiness,
  resolveEquipmentStepModel,
  resolveStartingEquipmentOptionSummaries,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type ChoiceSet,
  type EquipmentPackageSwitchBlockingReason,
  type EquipmentPackageSwitchInventorySnapshot,
  type ResolvedStartingEquipmentFunding,
  type StartingPackageConversionPreview,
} from '@rpg/contracts'

import {
  buildEquipmentAddPurchasePatch,
  buildEquipmentRemoveEntryPatch,
  buildEquipmentSelectionPatch,
  buildEquipmentSetPurchaseQuantityPatch,
  buildMagicItemAcquisitionPatch,
  choiceSetsForEquipmentStep,
  findStartingEquipmentChoiceSet,
  hasGoldStartingEquipmentOption,
  readEquipmentPurchaseQuantity,
  readSelectedStartingEquipmentOption,
  resolveEquipmentStepBudget,
  resolveEquipmentStepPickerItems,
  resolvePurchaseSourceMode,
  resolveStartingGoldPurchaseId,
  shouldShowEquipmentBudget,
  shouldShowEquipmentFallback,
  shouldShowEquipmentPurchaseWorkflow,
  shouldShowEquipmentShopping,
  type EquipmentPickerWorkflowMode,
} from '../../lib/equipment-step.lib'
import { useEquipmentMagicItemWorkflow } from './use-equipment-magic-item-workflow.client'
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
  const [pickerWorkflowMode, setPickerWorkflowMode] =
    useState<EquipmentPickerWorkflowMode>('purchase')
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
  const stepModel = useMemo(
    () =>
      characterClass
        ? resolveEquipmentStepModel({
            draft,
            catalogIndex,
            startingWealth: context.characterCreationRules.startingWealth,
          })
        : undefined,
    [catalogIndex, characterClass, context.characterCreationRules.startingWealth, draft],
  )
  const fundingByOptionId =
    stepModel?.fundingByOptionId ?? new Map<string, ResolvedStartingEquipmentFunding>()
  const classOptionPolicy =
    stepModel?.currentFunding?.classOptionPolicy ??
    [...fundingByOptionId.values()][0]?.classOptionPolicy ??
    'included'
  const classOptionsReplaced = classOptionPolicy === 'replaced'
  const tierLabel =
    stepModel?.currentFunding?.tierLabel ?? [...fundingByOptionId.values()][0]?.tierLabel
  const summaries = useMemo(
    () =>
      characterClass
        ? resolveStartingEquipmentOptionSummaries(characterClass, catalogIndex, draft, {
            fundingByOptionId,
          })
        : [],
    [catalogIndex, characterClass, draft, fundingByOptionId],
  )
  const selectedOptionId = readSelectedStartingEquipmentOption(draft, classId)
  const showFallback =
    !classOptionsReplaced &&
    shouldShowEquipmentFallback(summaries) &&
    !hasGoldStartingEquipmentOption(summaries)
  const showBudget = shouldShowEquipmentBudget(draft, selectedOptionId)
  const showShopping =
    !classOptionsReplaced && shouldShowEquipmentShopping(draft, selectedOptionId, characterClass)
  const budget = useMemo(
    () => (showBudget ? resolveEquipmentStepBudget(draft, catalogIndex, context) : undefined),
    [catalogIndex, context, draft, showBudget],
  )

  const goldOptionFunding = useMemo(() => {
    const startingEquipment = characterClass?.characterCreation?.startingEquipment
    if (!startingEquipment) return undefined

    const goldOption = startingEquipment.options.find(isStartingGoldOption)
    return goldOption ? fundingByOptionId.get(goldOption.id) : undefined
  }, [characterClass, fundingByOptionId])

  const resolveGoldOptionFunding = (): ResolvedStartingEquipmentFunding | undefined =>
    goldOptionFunding

  const resolveTargetFunding = (
    targetOptionId: string,
  ): ResolvedStartingEquipmentFunding | undefined => fundingByOptionId.get(targetOptionId)
  const showPurchaseWorkflow = shouldShowEquipmentPurchaseWorkflow(draft, selectedOptionId, budget)
  const { items: pickerItems, browseSortContext: pickerBrowseSortContext } = useMemo(
    () =>
      characterClass
        ? resolveEquipmentStepPickerItems({
            draft,
            characterClass,
            catalogIndex,
            choiceSets: resolvedChoiceSets,
            budget,
          })
        : { items: [], browseSortContext: { preferMartialWeaponBrowseOrder: false } },
    [budget, catalogIndex, characterClass, draft, resolvedChoiceSets],
  )
  const magicItemWorkflow = useEquipmentMagicItemWorkflow({
    draft,
    context,
    catalogIndex,
    pickerItems,
    pickerWorkflowMode,
    showPurchaseWorkflow,
  })
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
        characterClass: characterClass!,
      }),
    )
    setIsPackageChooserExpanded(false)
  }

  const openPackageSwitchResolution = (
    optionId: string,
    nestedSelections: CharacterBuilderDraft['choiceSelections'],
  ) => {
    const targetFunding = resolveTargetFunding(optionId)
    if (!targetFunding) return

    const evaluation = evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex,
      targetOptionId: optionId,
      targetFunding,
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

    const targetFunding = resolveTargetFunding(pendingPackageSwitch.targetOptionId)
    if (!targetFunding) {
      dismissPackageSwitch()
      return
    }

    const result = buildEquipmentPackageSwitchPatch({
      draft,
      catalogIndex,
      targetOptionId: pendingPackageSwitch.targetOptionId,
      targetFunding,
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
          targetFunding,
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

    const targetFunding = resolveTargetFunding(pendingPackageSwitch.targetOptionId)
    if (!targetFunding) return undefined

    return evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex,
      targetOptionId: pendingPackageSwitch.targetOptionId,
      targetFunding,
      nestedSelections: pendingPackageSwitch.nestedSelections,
      draftQuantitiesByPurchaseId: pendingPackageSwitch.draftQuantitiesByPurchaseId,
    })
  }, [catalogIndex, draft, fundingByOptionId, pendingPackageSwitch])

  useEffect(() => {
    setPendingPackageSwitch((prev) => {
      if (!prev) return null

      const actualSnapshot = createEquipmentPackageSwitchInventorySnapshot(draft)
      if (equipmentPackageSwitchSnapshotsEqual(prev.committedInventorySnapshot, actualSnapshot)) {
        return prev
      }

      const targetFunding = resolveTargetFunding(prev.targetOptionId)
      if (!targetFunding) return null

      const evaluation = evaluateEquipmentPackageSwitch({
        draft,
        catalogIndex,
        targetOptionId: prev.targetOptionId,
        targetFunding,
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
  }, [catalogIndex, draft, fundingByOptionId])

  const requestSelection = (
    optionId: string,
    nestedSelections: CharacterBuilderDraft['choiceSelections'],
  ) => {
    if (!classId || !startingEquipmentChoiceSet || classOptionsReplaced) return
    if (optionId === selectedOptionId) {
      setIsPackageChooserExpanded(false)
      return
    }

    const nextSelection = { optionId, nestedSelections }
    const targetFunding = resolveTargetFunding(optionId)
    const packageSwitchPreview =
      targetFunding &&
      evaluateEquipmentPackageSwitch({
        draft,
        catalogIndex,
        targetOptionId: optionId,
        targetFunding,
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

  const openPicker = (mode: EquipmentPickerWorkflowMode = 'purchase') => {
    setPickerWorkflowMode(mode)
    setPickerOpen(true)
  }

  const expandPackageChooser = () => {
    if (classOptionsReplaced) return
    setIsPackageChooserExpanded(true)
  }

  const collapsePackageChooser = () => {
    setIsPackageChooserExpanded(false)
  }

  const defaultSelectedPackageItemKeys = (deselectedKeys: ReadonlySet<string> = new Set()) => {
    if (!selectedOptionId) return new Set<string>()

    const targetFunding = resolveGoldOptionFunding()
    if (!targetFunding) return new Set<string>()

    const preview = buildStartingPackageConversionPreview({
      draft,
      catalogIndex,
      departingOptionId: selectedOptionId,
      selectedPackageItemKeys: new Set(),
      targetFunding,
    })

    if (!preview) return new Set<string>()

    return new Set(
      preview.items
        .filter((item) => item.status === 'selectable' && !deselectedKeys.has(item.packageItemKey))
        .map((item) => item.packageItemKey),
    )
  }

  const openConversionEditor = (deselectedKeys: ReadonlySet<string> = new Set()) => {
    if (classOptionsReplaced) return
    setConversionCommitStatusMessage(undefined)
    setSelectedPackageItemKeys(defaultSelectedPackageItemKeys(deselectedKeys))
    setConversionEditorOpen(true)
  }

  const handleCommitConversion = (_preview: StartingPackageConversionPreview) => {
    if (!selectedOptionId) return

    const targetFunding = resolveGoldOptionFunding()
    if (!targetFunding) return

    const patch = buildStartingPackageConversionPatch({
      draft,
      catalogIndex,
      departingOptionId: selectedOptionId,
      selectedPackageItemKeys,
      targetFunding,
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
    if (pickerWorkflowMode === 'magic_items') {
      const patch = buildMagicItemAcquisitionPatch({
        draft,
        context,
        catalogIndex,
        equipmentId: item.equipment.id,
        requestedQuantity: quantity,
      })
      if (patch) onDraftChange(patch)
      return
    }

    if (!showBudget) return

    const patch = buildEquipmentAddPurchasePatch({
      draft,
      catalogIndex,
      equipmentId: item.equipment.id,
      sourceMode: resolvePurchaseSourceMode(),
      quantity,
      budget,
      context,
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
      budget,
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
      budget,
    })
    if (patch) onDraftChange(patch)
  }

  return {
    catalogIndex,
    context,
    characterClass,
    classId,
    equipmentChoiceSets,
    resolvedChoiceSets,
    summaries,
    selectedOptionId,
    goldOptionFunding,
    classOptionPolicy,
    classOptionsReplaced,
    tierLabel,
    showFallback,
    showBudget,
    showShopping,
    showMagicItemGrants: magicItemWorkflow.showMagicItemGrants,
    showPurchaseWorkflow,
    acquisition: magicItemWorkflow.acquisition,
    magicItemProgressLabel: magicItemWorkflow.magicItemProgressLabel,
    pickerWorkflowMode,
    pickerWorkflowModes: magicItemWorkflow.pickerWorkflowModes,
    budget,
    pickerItems: magicItemWorkflow.filteredPickerItems,
    allPickerItems: pickerItems,
    pickerBrowseSortContext,
    characterPreviewContext,
    ownedPurchaseQuantities,
    ownedGrantQuantities: magicItemWorkflow.ownedGrantQuantities,
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
    setPickerWorkflowMode,
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
