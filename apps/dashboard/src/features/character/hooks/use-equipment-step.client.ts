'use client'

import { useEffect, useMemo, useState, type ComponentProps } from 'react'

import {
  applyEquipmentStepAction,
  buildStartingPackageConversionPreview,
  createEquipmentPackageSwitchInventorySnapshot,
  equipmentPackageSwitchSnapshotsEqual,
  evaluateEquipmentPackageSwitch,
  indexCharacterBuildCatalog,
  initPackageSwitchDraftQuantities,
  isStartingGoldOption,
  rebuildPackageSwitchDraftQuantities,
  resolveBuilderStepReadiness,
  resolveEquipmentAcquisitionBuilderContext,
  resolveEquipmentStepModel,
  resolveStartingEquipmentOptionSummaries,
  standardStartingWealthTableId,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterClass,
  type ChoiceSet,
  type EquipmentPackageSwitchBlockingReason,
  type EquipmentPackageSwitchEvaluation,
  type EquipmentPackageSwitchInventorySnapshot,
  type EquipmentStepRemoveTarget,
  type EquipmentStepUnavailableReason,
  type ResolvedStartingEquipmentFunding,
  type StartingPackageConversionPreview,
} from '@rpg/contracts'

import {
  choiceSetsForEquipmentStep,
  findStartingEquipmentChoiceSet,
  readEquipmentPurchaseQuantity,
  readSelectedStartingEquipmentOption,
  resolveEquipmentStepBudget,
  resolveEquipmentStepPickerItems,
  resolvePurchaseSourceMode,
  resolveStartingGoldPurchaseId,
  shouldShowEquipmentPurchaseWorkflow,
  type EquipmentPickerWorkflowMode,
} from '../lib/equipment/equipment-step.lib'
import { useEquipmentMagicItemWorkflow } from './use-equipment-magic-item-workflow.client'
import { withChoiceSetSelections } from '../lib/choice-sets/choice-set-selections'
import { resolveEquipmentStepSurface } from '../lib/equipment/resolve-equipment-step-surface.lib'
import { resolveEquipmentPickerCharacterPreviewContext } from '../components/equipment/equipment-picker-character-preview.lib'
import { resolvePackageSwitchCommitErrorFromIssues } from '../components/equipment/equipment-package-switch-resolution.lib'
import type { EquipmentPickerDrawer } from '../components/equipment/equipment-picker-drawer.client'
import type { EquipmentStepInventorySectionProps } from '../components/steps/equipment-step-sections.client'

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

function resolveGoldOptionFundingFromClass(
  characterClass: CharacterClass | undefined,
  fundingByOptionId: ReadonlyMap<string, ResolvedStartingEquipmentFunding>,
): ResolvedStartingEquipmentFunding | undefined {
  const startingEquipment = characterClass?.characterCreation?.startingEquipment
  if (!startingEquipment) return undefined
  const goldOption = startingEquipment.options.find(isStartingGoldOption)
  return goldOption ? fundingByOptionId.get(goldOption.id) : undefined
}

function collectOwnedPurchaseQuantities(
  draft: CharacterBuilderDraft,
  activePurchaseSourceMode: ReturnType<typeof resolvePurchaseSourceMode> | undefined,
): Record<string, number> {
  if (!activePurchaseSourceMode) return {}

  const quantities: Record<string, number> = {}
  for (const purchase of draft.equipment?.purchases ?? []) {
    if (purchase.sourceMode === activePurchaseSourceMode) {
      quantities[purchase.equipmentId] = purchase.quantity
    }
  }
  return quantities
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
  const [focusedAllowanceId, setFocusedAllowanceId] = useState<string | undefined>(undefined)
  const [conversionEditorOpen, setConversionEditorOpen] = useState(false)
  const [selectedPackageItemKeys, setSelectedPackageItemKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const [conversionCommitStatusMessage, setConversionCommitStatusMessage] = useState<
    string | undefined
  >(undefined)
  const [blockedEquipmentActionReason, setBlockedEquipmentActionReason] =
    useState<EquipmentStepUnavailableReason | null>(null)
  const [isPackageChooserExpanded, setIsPackageChooserExpanded] = useState(false)

  const classId = draft.class.classId
  const catalogIndex = useMemo(() => indexCharacterBuildCatalog(context.catalog), [context.catalog])
  const acquisitionContext = useMemo(
    () =>
      resolveEquipmentAcquisitionBuilderContext({
        context,
        catalogIndex,
        startingWealthTableId: standardStartingWealthTableId(context.rulesetId),
      }),
    [catalogIndex, context],
  )
  const characterClass = classId ? catalogIndex.classes.get(classId) : undefined
  const equipmentChoiceSets = useMemo(
    () => choiceSetsForEquipmentStep(resolvedChoiceSets),
    [resolvedChoiceSets],
  )
  const stepModelResult = useMemo(
    () =>
      characterClass
        ? resolveEquipmentStepModel({
            draft,
            catalogIndex,
            context,
            resolvedChoiceSets,
            startingWealth: context.characterCreationRules.startingWealth,
          })
        : { status: 'unavailable' as const, reason: 'class_not_in_catalog' as const },
    [
      catalogIndex,
      characterClass,
      context,
      context.characterCreationRules.startingWealth,
      draft,
      resolvedChoiceSets,
    ],
  )
  const readiness = useMemo(() => {
    if (stepModelResult.status === 'available') {
      return stepModelResult.model.readiness
    }
    return resolveBuilderStepReadiness('equipment', draft, context, resolvedChoiceSets)
  }, [context, draft, resolvedChoiceSets, stepModelResult])
  const startingEquipmentChoiceSet = classId
    ? findStartingEquipmentChoiceSet(resolvedChoiceSets, classId)
    : undefined
  const stepModel = stepModelResult.status === 'available' ? stepModelResult.model : undefined
  const fundingByOptionId =
    stepModel?.fundingByOptionId ?? new Map<string, ResolvedStartingEquipmentFunding>()
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
  const equipmentStepSurfaceResult = resolveEquipmentStepSurface({
    draft,
    characterClass,
    classId,
    stepModel,
    summaries,
    selectedOptionId,
  })
  const equipmentStepUnavailableReason =
    equipmentStepSurfaceResult.status === 'unavailable'
      ? equipmentStepSurfaceResult.reason
      : undefined
  const {
    classOptionPolicy,
    classOptionsReplaced,
    tierLabel,
    showFallback,
    showBudget,
    showShopping,
  } =
    equipmentStepSurfaceResult.status === 'available'
      ? equipmentStepSurfaceResult.surface
      : {
          classOptionPolicy: 'included' as const,
          classOptionsReplaced: false,
          tierLabel: undefined,
          showFallback: false,
          showBudget: false,
          showShopping: false,
        }
  const budget = useMemo(
    () => (showBudget ? resolveEquipmentStepBudget(draft, catalogIndex, context) : undefined),
    [catalogIndex, context, draft, equipmentStepSurfaceResult],
  )

  const goldOptionFunding = useMemo(
    () => resolveGoldOptionFundingFromClass(characterClass, fundingByOptionId),
    [characterClass, fundingByOptionId],
  )

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
    focusedAllowanceId,
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
  const ownedPurchaseQuantities = useMemo(
    () => collectOwnedPurchaseQuantities(draft, activePurchaseSourceMode),
    [activePurchaseSourceMode, draft.equipment?.purchases],
  )

  const applyEquipmentAction = (
    action: Parameters<typeof applyEquipmentStepAction>[0]['action'],
  ) => {
    const result = applyEquipmentStepAction({
      draft,
      catalogIndex,
      budget,
      acquisitionContext,
      startingWealth: context.characterCreationRules.startingWealth,
      action,
    })
    if (result.status === 'applied') onDraftChange(result.patch)
    if (result.status === 'needs_resolution') {
      openPackageSwitchResolutionFromEvaluation(
        result.resolution,
        action.kind === 'select_package'
          ? action.nestedSelections
          : (pendingPackageSwitch?.nestedSelections ?? {}),
      )
    }
    return result
  }

  const openPackageSwitchResolutionFromEvaluation = (
    evaluation: EquipmentPackageSwitchEvaluation,
    nestedSelections: CharacterBuilderDraft['choiceSelections'],
  ) => {
    if (evaluation.status === 'noConflict') return

    setBlockedEquipmentActionReason(null)
    setPendingPackageSwitch({
      targetOptionId: evaluation.targetOptionId,
      nestedSelections,
      draftQuantitiesByPurchaseId: initPackageSwitchDraftQuantities(evaluation),
      committedInventorySnapshot: createEquipmentPackageSwitchInventorySnapshot(draft),
    })
  }

  const applySelection = (selection: PendingEquipmentSelection) => {
    if (!classId || !startingEquipmentChoiceSet || !characterClass) {
      if (!characterClass && classId) {
        setBlockedEquipmentActionReason('class_not_in_catalog')
      }
      return
    }

    setBlockedEquipmentActionReason(null)
    const result = applyEquipmentAction({
      kind: 'select_package',
      optionId: selection.optionId,
      choiceSetId: startingEquipmentChoiceSet.id,
      nestedSelections: selection.nestedSelections,
    })
    if (result.status === 'applied') {
      setIsPackageChooserExpanded(false)
    }
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

    const result = applyEquipmentAction({
      kind: 'resolve_package_switch',
      targetOptionId: pendingPackageSwitch.targetOptionId,
      choiceSetId: startingEquipmentChoiceSet.id,
      nestedSelections: pendingPackageSwitch.nestedSelections,
      draftQuantitiesByPurchaseId: pendingPackageSwitch.draftQuantitiesByPurchaseId,
      committedInventorySnapshot: pendingPackageSwitch.committedInventorySnapshot,
    })

    if (result.status === 'applied') {
      dismissPackageSwitch()
      setIsPackageChooserExpanded(false)
      return
    }

    if (result.status === 'invalid') {
      const commitError = resolvePackageSwitchCommitErrorFromIssues(result.issues)
      if (!commitError) {
        dismissPackageSwitch()
        setIsPackageSwitchCommitting(false)
        return
      }

      if (commitError.kind === 'staleCommittedInventory') {
        const targetFunding = resolveTargetFunding(pendingPackageSwitch.targetOptionId)
        if (!targetFunding) {
          dismissPackageSwitch()
          return
        }

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
          commitErrorReason: commitError,
          staleNotice: true,
        })
      } else {
        setPendingPackageSwitch({
          ...pendingPackageSwitch,
          commitErrorReason: commitError,
        })
      }

      setIsPackageSwitchCommitting(false)
      return
    }

    setIsPackageSwitchCommitting(false)
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

  // Keeps pending package-switch draft quantities aligned with live inventory snapshots.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reactive reconciliation when draft edits change inventory outside the modal.
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

    if (draft.equipment?.customized) {
      setPendingSelection(nextSelection)
      return
    }

    const result = applyEquipmentAction({
      kind: 'select_package',
      optionId,
      choiceSetId: startingEquipmentChoiceSet.id,
      nestedSelections,
    })

    if (result.status === 'invalid') {
      if (result.issues.some((issue) => issue.code === 'package_switch_funding_missing')) {
        setBlockedEquipmentActionReason('funding_context_missing')
      }
      return
    }

    if (result.status === 'applied') {
      setIsPackageChooserExpanded(false)
    }
  }

  const openPicker = (
    mode: EquipmentPickerWorkflowMode = 'purchase',
    options?: { allowanceId?: string },
  ) => {
    setPickerWorkflowMode(mode)
    setFocusedAllowanceId(options?.allowanceId)
    setPickerOpen(true)
  }

  const handlePickerOpenChange = (open: boolean) => {
    setPickerOpen(open)
    if (!open) setFocusedAllowanceId(undefined)
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

    const result = applyEquipmentAction({
      kind: 'commit_package_conversion',
      departingOptionId: selectedOptionId,
      selectedPackageItemKeys: [...selectedPackageItemKeys],
    })

    if (result.status === 'applied') {
      setConversionEditorOpen(false)
      setConversionCommitStatusMessage('Starting equipment converted to starting gold.')
    }
  }

  const handleAddItem: ComponentProps<typeof EquipmentPickerDrawer>['onAddItem'] = (
    item,
    quantity,
  ) => {
    if (pickerWorkflowMode === 'magic_items') {
      applyEquipmentAction({
        kind: 'acquire_magic_item',
        equipmentId: item.equipment.id,
        requestedQuantity: quantity,
      })
      return
    }

    if (!showBudget) return

    applyEquipmentAction({
      kind: 'add_purchase',
      equipmentId: item.equipment.id,
      sourceMode: resolvePurchaseSourceMode(),
      quantity,
    })
  }

  const handleSetPurchaseQuantity = (
    target: Parameters<NonNullable<EquipmentStepInventorySectionProps['onSetPurchaseQuantity']>>[0],
    quantity: number,
  ) => {
    applyEquipmentAction({
      kind: 'set_purchase_quantity',
      purchaseId: target.purchaseId,
      quantity,
    })
  }

  const handleRemoveFromInventory: ComponentProps<
    typeof EquipmentPickerDrawer
  >['onRemoveFromInventory'] = (item) => {
    const purchaseId = resolveStartingGoldPurchaseId(draft, item.equipment.id)
    if (!purchaseId) return

    applyEquipmentAction({
      kind: 'remove_entry',
      target: { kind: 'purchase', purchaseId },
    })
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

    applyEquipmentAction({
      kind: 'set_purchase_quantity',
      purchaseId,
      quantity: currentQuantity - 1,
    })
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
    focusedAllowanceId,
    setFocusedAllowanceId,
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
    setPickerOpen: handlePickerOpenChange,
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
    skipStartingEquipment: () => applyEquipmentAction({ kind: 'skip_starting_equipment' }),
    onRemoveItem: (target: EquipmentStepRemoveTarget) =>
      applyEquipmentAction({ kind: 'remove_entry', target }),
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
    equipmentStepUnavailableReason,
    blockedEquipmentActionReason,
    clearBlockedEquipmentActionReason: () => setBlockedEquipmentActionReason(null),
  }
}
