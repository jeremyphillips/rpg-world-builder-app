import type { StartingWealthRules } from '../../../../campaign/rules/starting-wealth'
import {
  isStartingGoldOption,
  resolveEquipmentModeFromOption,
  type StartingEquipmentOption,
} from '../../../../content/starting-equipment'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'
import type {
  EquipmentStepAction,
  EquipmentStepActionIssue,
  EquipmentStepActionResult,
} from '../../equipment-step-action'
import {
  buildEquipmentPackageSwitchPatch,
  evaluateEquipmentPackageSwitch,
  type EquipmentPackageSwitchBlockingReason,
  type EquipmentPackageSwitchInventorySnapshot,
} from '../../equipment-package-switch'
import { buildStartingPackageConversionPatch } from '../../starting-package-conversion'
import { resolveStartingEquipmentFundingOptions } from './resolve-starting-equipment-funding'

type PackageSwitchActionArgs = {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  startingWealth?: StartingWealthRules
}

function packageSwitchCommitErrorToIssue(
  error: EquipmentPackageSwitchBlockingReason,
): EquipmentStepActionIssue {
  switch (error.kind) {
    case 'nonEditableOverBudget':
      return {
        code: 'package_switch_non_editable_over_budget',
        reference: {
          nonEditableRetainedCostCp: error.nonEditableRetainedCostCp,
          targetAllowanceCp: error.targetAllowanceCp,
        },
      }
    case 'staleCommittedInventory':
      return { code: 'package_switch_stale_inventory' }
    case 'draftOverBudget':
      return {
        code: 'package_switch_over_budget',
        reference: { amountOverBudgetCp: error.amountOverBudgetCp },
      }
    case 'invalidDraftQuantity':
      return {
        code: 'package_switch_invalid_quantity',
        reference: {
          purchaseId: error.purchaseId,
          committedQuantity: error.committedQuantity,
          draftQuantity: error.draftQuantity,
        },
      }
    case 'missingTargetOption':
      return { code: 'package_switch_missing_target_option' }
    case 'missingPurchase':
      return {
        code: 'package_switch_missing_purchase',
        reference: { purchaseId: error.purchaseId },
      }
    default: {
      const _exhaustive: never = error
      return _exhaustive
    }
  }
}

function resolveTargetFunding(args: PackageSwitchActionArgs & { targetOptionId: string }) {
  return resolveStartingEquipmentFundingOptions({
    draft: args.draft,
    catalogIndex: args.catalogIndex,
    startingWealth: args.startingWealth,
  }).get(args.targetOptionId)
}

function resolveGoldOptionFunding(args: PackageSwitchActionArgs) {
  const classId = args.draft.class.classId
  if (!classId) return undefined

  const characterClass = args.catalogIndex.classes.get(classId)
  const goldOption =
    characterClass?.characterCreation?.startingEquipment?.options.find(isStartingGoldOption)
  if (!goldOption) return undefined

  return resolveTargetFunding({
    ...args,
    targetOptionId: goldOption.id,
  })
}

function resolveSelectPackageOption(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  optionId: string
}):
  | { status: 'valid'; option: StartingEquipmentOption }
  | { status: 'invalid'; issues: EquipmentStepActionIssue[] } {
  const classId = args.draft.class.classId
  if (!classId) {
    return { status: 'invalid', issues: [{ code: 'class_not_in_catalog' }] }
  }

  const characterClass = args.catalogIndex.classes.get(classId)
  if (!characterClass) {
    return { status: 'invalid', issues: [{ code: 'class_not_in_catalog' }] }
  }

  const option = characterClass.characterCreation?.startingEquipment?.options.find(
    (entry) => entry.id === args.optionId,
  )
  if (!option) {
    return {
      status: 'invalid',
      issues: [{ code: 'option_not_in_catalog', reference: { optionId: args.optionId } }],
    }
  }

  return { status: 'valid', option }
}

function applySelectPackageAction(
  args: PackageSwitchActionArgs & {
    optionId: string
    choiceSetId: string
    nestedSelections: CharacterBuilderDraft['choiceSelections']
  },
): EquipmentStepActionResult {
  const optionResult = resolveSelectPackageOption({
    draft: args.draft,
    catalogIndex: args.catalogIndex,
    optionId: args.optionId,
  })
  if (optionResult.status === 'invalid') {
    return { status: 'invalid', issues: optionResult.issues }
  }

  const targetFunding = resolveTargetFunding({
    draft: args.draft,
    catalogIndex: args.catalogIndex,
    startingWealth: args.startingWealth,
    targetOptionId: args.optionId,
  })
  if (!targetFunding) {
    return { status: 'invalid', issues: [{ code: 'package_switch_funding_missing' }] }
  }

  const evaluation = evaluateEquipmentPackageSwitch({
    draft: args.draft,
    catalogIndex: args.catalogIndex,
    targetOptionId: args.optionId,
    targetFunding,
    nestedSelections: args.nestedSelections,
  })
  if (evaluation && evaluation.status !== 'noConflict') {
    return { status: 'needs_resolution', resolution: evaluation }
  }

  const mode = resolveEquipmentModeFromOption(optionResult.option)

  return {
    status: 'applied',
    patch: {
      choiceSelections: {
        ...args.draft.choiceSelections,
        ...args.nestedSelections,
        [args.choiceSetId]: [args.optionId],
      },
      equipment: {
        mode,
        purchases: args.draft.equipment?.purchases ?? [],
        magicItemSelections: args.draft.equipment?.magicItemSelections ?? [],
        removedPackageItemKeys: [],
        customized: args.draft.equipment?.customized ?? false,
        skipped: false,
      },
    },
  }
}

function applyResolvePackageSwitchAction(
  args: PackageSwitchActionArgs & {
    targetOptionId: string
    choiceSetId: string
    nestedSelections: CharacterBuilderDraft['choiceSelections']
    draftQuantitiesByPurchaseId: Record<string, number>
    committedInventorySnapshot: EquipmentPackageSwitchInventorySnapshot
  },
): EquipmentStepActionResult {
  const targetFunding = resolveTargetFunding({
    draft: args.draft,
    catalogIndex: args.catalogIndex,
    startingWealth: args.startingWealth,
    targetOptionId: args.targetOptionId,
  })
  if (!targetFunding) {
    return { status: 'invalid', issues: [{ code: 'package_switch_funding_missing' }] }
  }

  const result = buildEquipmentPackageSwitchPatch({
    draft: args.draft,
    catalogIndex: args.catalogIndex,
    targetOptionId: args.targetOptionId,
    targetFunding,
    choiceSetId: args.choiceSetId,
    nestedSelections: args.nestedSelections,
    draftQuantitiesByPurchaseId: args.draftQuantitiesByPurchaseId,
    committedInventorySnapshot: args.committedInventorySnapshot,
  })

  if (result.status === 'success') {
    return { status: 'applied', patch: result.patch }
  }

  return {
    status: 'invalid',
    issues: [packageSwitchCommitErrorToIssue(result.commitError)],
  }
}

function applyCommitPackageConversionAction(
  args: PackageSwitchActionArgs & {
    departingOptionId: string
    selectedPackageItemKeys: readonly string[]
  },
): EquipmentStepActionResult {
  const targetFunding = resolveGoldOptionFunding(args)
  if (!targetFunding) {
    return { status: 'invalid', issues: [{ code: 'package_conversion_funding_missing' }] }
  }

  const patch = buildStartingPackageConversionPatch({
    draft: args.draft,
    catalogIndex: args.catalogIndex,
    departingOptionId: args.departingOptionId,
    selectedPackageItemKeys: new Set(args.selectedPackageItemKeys),
    targetFunding,
  })

  if (!patch) {
    return { status: 'invalid', issues: [{ code: 'package_conversion_invalid' }] }
  }

  return { status: 'applied', patch }
}

export function dispatchEquipmentPackageSwitchAction(
  action: Extract<
    EquipmentStepAction,
    { kind: 'select_package' | 'resolve_package_switch' | 'commit_package_conversion' }
  >,
  args: PackageSwitchActionArgs,
): EquipmentStepActionResult {
  switch (action.kind) {
    case 'select_package':
      return applySelectPackageAction({
        ...args,
        optionId: action.optionId,
        choiceSetId: action.choiceSetId,
        nestedSelections: action.nestedSelections,
      })
    case 'resolve_package_switch':
      return applyResolvePackageSwitchAction({
        ...args,
        targetOptionId: action.targetOptionId,
        choiceSetId: action.choiceSetId,
        nestedSelections: action.nestedSelections,
        draftQuantitiesByPurchaseId: action.draftQuantitiesByPurchaseId,
        committedInventorySnapshot: action.committedInventorySnapshot,
      })
    case 'commit_package_conversion':
      return applyCommitPackageConversionAction({
        ...args,
        departingOptionId: action.departingOptionId,
        selectedPackageItemKeys: action.selectedPackageItemKeys,
      })
    default: {
      const _exhaustive: never = action
      return _exhaustive
    }
  }
}
