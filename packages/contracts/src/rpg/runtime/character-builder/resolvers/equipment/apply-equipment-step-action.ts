import type { Equipment } from '../../../../content/equipment'
import { resolveEquipmentModeFromOption } from '../../../../content/starting-equipment'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'
import type {
  EquipmentStepAction,
  EquipmentStepActionIssue,
  EquipmentStepActionResult,
  EquipmentStepRemoveTarget,
} from '../../equipment-step-action'
import {
  mergeCompatiblePurchasedEntries,
  normalizeEquipmentPurchase,
  resolveEquipmentPurchaseIndex,
} from '../../equipment-purchase'
import {
  applyEquipmentPurchaseIntent,
  applyMagicItemAcquisitionIntent,
} from './apply-equipment-intents'
import type { EquipmentAcquisitionBuilderContext } from './equipment-acquisition-types'
import type { EquipmentBudgetSummary } from './equipment-budget'
import {
  reconcileMagicItemSelections,
  upsertMagicItemGrantSelection,
} from './reconcile-magic-item-selections'
import {
  clampEquipmentPurchaseQuantity,
  resolveEquipmentPurchaseQuantityLimits,
} from './resolve-equipment-purchase-quantity-limits'
import { readMagicItemSelections } from './resolve-magic-item-grant-progress'
import { readSelectedStartingEquipmentOptionId } from './resolve-starting-equipment-choice-sets'

type CharacterBuilderDraftEquipmentPurchase = NonNullable<
  CharacterBuilderDraft['equipment']
>['purchases'][number]

function readEquipmentPurchaseQuantity(
  draft: CharacterBuilderDraft,
  equipmentId: string,
  sourceMode: CharacterBuilderDraftEquipmentPurchase['sourceMode'],
): number {
  const purchase = (draft.equipment?.purchases ?? []).find(
    (entry) => entry.equipmentId === equipmentId && entry.sourceMode === sourceMode,
  )
  return purchase?.quantity ?? 0
}

function resolveCachedEquipmentMode(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): NonNullable<CharacterBuilderDraft['equipment']>['mode'] {
  if (draft.equipment?.mode) return draft.equipment.mode

  const classId = draft.class.classId
  if (!classId) return 'package'

  const characterClass = catalogIndex.classes.get(classId)
  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  const option = characterClass?.characterCreation?.startingEquipment?.options.find(
    (entry) => entry.id === selectedOptionId,
  )

  return option ? resolveEquipmentModeFromOption(option) : 'package'
}

function upsertEquipmentPurchase(args: {
  purchases: CharacterBuilderDraftEquipmentPurchase[]
  equipment: Equipment
  equipmentId: string
  sourceMode: CharacterBuilderDraftEquipmentPurchase['sourceMode']
  quantity: number
}): CharacterBuilderDraftEquipmentPurchase[] {
  const { purchases, equipment, equipmentId, sourceMode, quantity } = args

  const normalizedPurchases = purchases.map((_, index) =>
    normalizeEquipmentPurchase(purchases, index),
  )

  return mergeCompatiblePurchasedEntries({
    purchases: normalizedPurchases,
    incoming: {
      equipmentId,
      quantity,
      sourceMode,
      origin: 'picker',
    },
    equipment,
  })
}

function buildEquipmentDraftFromPurchase(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  purchases: CharacterBuilderDraftEquipmentPurchase[]
  sourceMode: CharacterBuilderDraftEquipmentPurchase['sourceMode']
}): CharacterBuilderDraft['equipment'] {
  const { draft, catalogIndex, purchases, sourceMode } = args

  return {
    mode: resolveCachedEquipmentMode(draft, catalogIndex),
    purchases,
    magicItemSelections: draft.equipment?.magicItemSelections ?? [],
    removedPackageItemKeys: draft.equipment?.removedPackageItemKeys ?? [],
    customized: sourceMode === 'manual' ? true : (draft.equipment?.customized ?? false),
    skipped: false,
  }
}

function canIncreasePurchaseQuantity(args: {
  equipment: Equipment
  draft: CharacterBuilderDraft
  equipmentId: string
  sourceMode: CharacterBuilderDraftEquipmentPurchase['sourceMode']
  quantity: number
  budget?: EquipmentBudgetSummary
}): boolean {
  const { equipment, draft, equipmentId, sourceMode, quantity, budget } = args
  if (sourceMode === 'manual') return false
  if (quantity < 1) return false

  const currentQuantity = readEquipmentPurchaseQuantity(draft, equipmentId, sourceMode)
  const limits = resolveEquipmentPurchaseQuantityLimits({
    equipment,
    sourceMode,
    budget,
    currentQuantity,
    isPurchaseRow: true,
  })

  return currentQuantity + quantity <= limits.max
}

function applySkipStartingEquipmentAction(): EquipmentStepActionResult {
  return {
    status: 'applied',
    patch: {
      equipment: {
        mode: 'package',
        purchases: [],
        magicItemSelections: [],
        removedPackageItemKeys: [],
        customized: false,
        skipped: true,
      },
    },
  }
}

function applySelectPackageAction(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  optionId: string
  choiceSetId: string
  nestedSelections: CharacterBuilderDraft['choiceSelections']
}): EquipmentStepActionResult {
  const { draft, catalogIndex, optionId, choiceSetId, nestedSelections } = args
  const classId = draft.class.classId
  if (!classId) {
    return { status: 'invalid', issues: [{ code: 'class_not_in_catalog' }] }
  }

  const characterClass = catalogIndex.classes.get(classId)
  if (!characterClass) {
    return { status: 'invalid', issues: [{ code: 'class_not_in_catalog' }] }
  }

  const option = characterClass.characterCreation?.startingEquipment?.options.find(
    (entry) => entry.id === optionId,
  )
  if (!option) {
    return {
      status: 'invalid',
      issues: [{ code: 'option_not_in_catalog', reference: { optionId } }],
    }
  }

  const mode = resolveEquipmentModeFromOption(option)

  return {
    status: 'applied',
    patch: {
      choiceSelections: {
        ...draft.choiceSelections,
        ...nestedSelections,
        [choiceSetId]: [optionId],
      },
      equipment: {
        mode,
        purchases: draft.equipment?.purchases ?? [],
        magicItemSelections: draft.equipment?.magicItemSelections ?? [],
        removedPackageItemKeys: [],
        customized: draft.equipment?.customized ?? false,
        skipped: false,
      },
    },
  }
}

function applyRemoveEntryAction(args: {
  draft: CharacterBuilderDraft
  target: EquipmentStepRemoveTarget
}): EquipmentStepActionResult {
  const { draft, target } = args
  const current = draft.equipment ?? {
    mode: 'package' as const,
    purchases: [],
    removedPackageItemKeys: [],
    customized: false,
  }

  if (target.kind === 'package') {
    return { status: 'applied', patch: { equipment: current } }
  }

  if (target.kind === 'magicItemGrant') {
    const next = reconcileMagicItemSelections({
      draft,
      remove: [{ allowanceId: target.allowanceId, equipmentId: target.equipmentId }],
    })
    return { status: 'applied', patch: { equipment: next.equipment } }
  }

  const purchaseIndex = resolveEquipmentPurchaseIndex(current.purchases, target.purchaseId)
  if (purchaseIndex === undefined) {
    return { status: 'applied', patch: { equipment: current } }
  }

  const purchases = current.purchases.filter((_, index) => index !== purchaseIndex)

  return {
    status: 'applied',
    patch: {
      equipment: {
        ...current,
        purchases,
      },
    },
  }
}

function applyAddPurchaseAction(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  equipmentId: string
  sourceMode: CharacterBuilderDraftEquipmentPurchase['sourceMode']
  quantity: number
  budget?: EquipmentBudgetSummary
  acquisitionContext?: EquipmentAcquisitionBuilderContext
}): EquipmentStepActionResult {
  const { draft, catalogIndex, equipmentId, sourceMode, quantity, budget, acquisitionContext } =
    args

  if (sourceMode === 'startingGold' && acquisitionContext) {
    const equipment = catalogIndex.equipment.get(equipmentId)
    if (!equipment) {
      return {
        status: 'invalid',
        issues: [{ code: 'equipment_not_in_catalog', reference: { equipmentId } }],
      }
    }

    const result = applyEquipmentPurchaseIntent({
      draft,
      context: acquisitionContext,
      equipment,
      requestedQuantity: quantity,
    })

    if (!result.applied) {
      return { status: 'blocked', blockers: result.plan.blockers }
    }

    return { status: 'applied', patch: { equipment: result.draft.equipment } }
  }

  const equipment = catalogIndex.equipment.get(equipmentId)
  if (
    !equipment ||
    !canIncreasePurchaseQuantity({
      equipment,
      draft,
      equipmentId,
      sourceMode,
      quantity,
      budget,
    })
  ) {
    return {
      status: 'invalid',
      issues: [{ code: 'quantity_not_allowed', reference: { equipmentId } }],
    }
  }

  return {
    status: 'applied',
    patch: {
      equipment: buildEquipmentDraftFromPurchase({
        draft,
        catalogIndex,
        sourceMode,
        purchases: upsertEquipmentPurchase({
          purchases: [...(draft.equipment?.purchases ?? [])],
          equipment,
          equipmentId,
          sourceMode,
          quantity,
        }),
      }),
    },
  }
}

function applyAcquireMagicItemAction(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  equipmentId: string
  requestedQuantity: number
  acquisitionContext?: EquipmentAcquisitionBuilderContext
}): EquipmentStepActionResult {
  const { draft, catalogIndex, equipmentId, requestedQuantity, acquisitionContext } = args

  if (!acquisitionContext) {
    return { status: 'invalid', issues: [{ code: 'acquisition_context_missing' }] }
  }

  const equipment = catalogIndex.equipment.get(equipmentId)
  if (!equipment) {
    return {
      status: 'invalid',
      issues: [{ code: 'equipment_not_in_catalog', reference: { equipmentId } }],
    }
  }

  const result = applyMagicItemAcquisitionIntent({
    draft,
    context: acquisitionContext,
    equipment,
    requestedQuantity,
  })

  if (!result.applied) {
    return { status: 'blocked', blockers: result.plan.blockers }
  }

  return { status: 'applied', patch: { equipment: result.draft.equipment } }
}

function applyPurchaseIntentAction(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  equipmentId: string
  requestedQuantity: number
  acquisitionContext?: EquipmentAcquisitionBuilderContext
}): EquipmentStepActionResult {
  return applyAddPurchaseAction({
    ...args,
    sourceMode: 'startingGold',
    quantity: args.requestedQuantity,
  })
}

function applyReleaseMagicItemGrantAction(args: {
  draft: CharacterBuilderDraft
  allowanceId: string
  equipmentId: string
  quantity: number
}): EquipmentStepActionResult {
  const { draft, allowanceId, equipmentId, quantity } = args
  const selections = readMagicItemSelections(draft)
  const existing = selections.find(
    (row) => row.allowanceId === allowanceId && row.equipmentId === equipmentId,
  )

  if (!existing) {
    return {
      status: 'invalid',
      issues: [{ code: 'grant_not_found', reference: { allowanceId, equipmentId } }],
    }
  }

  if (quantity >= existing.quantity) {
    return applyRemoveEntryAction({
      draft,
      target: { kind: 'magicItemGrant', allowanceId, equipmentId },
    })
  }

  const current = draft.equipment
  if (!current) {
    return { status: 'invalid', issues: [{ code: 'equipment_channel_missing' }] }
  }

  return {
    status: 'applied',
    patch: {
      equipment: {
        ...current,
        magicItemSelections: upsertMagicItemGrantSelection({
          selections,
          allowanceId,
          equipmentId,
          quantity: existing.quantity - quantity,
        }),
      },
    },
  }
}

function applySetPurchaseQuantityAction(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  purchaseId: string
  quantity: number
  budget?: EquipmentBudgetSummary
}): EquipmentStepActionResult {
  const { draft, catalogIndex, purchaseId, quantity, budget } = args
  const current = draft.equipment

  if (!current) {
    return { status: 'invalid', issues: [{ code: 'equipment_channel_missing' }] }
  }

  const purchaseIndex = resolveEquipmentPurchaseIndex(current.purchases, purchaseId)
  if (purchaseIndex === undefined) {
    return {
      status: 'invalid',
      issues: [{ code: 'purchase_not_found', reference: { purchaseId } }],
    }
  }

  const purchase = current.purchases[purchaseIndex]
  if (!purchase) {
    return {
      status: 'invalid',
      issues: [{ code: 'purchase_not_found', reference: { purchaseId } }],
    }
  }

  const equipment = catalogIndex.equipment.get(purchase.equipmentId)
  if (!equipment) {
    return {
      status: 'invalid',
      issues: [
        {
          code: 'equipment_not_in_catalog',
          reference: { equipmentId: purchase.equipmentId },
        },
      ],
    }
  }

  if (quantity < 1) {
    return {
      status: 'invalid',
      issues: [{ code: 'quantity_out_of_range', reference: { purchaseId, quantity } }],
    }
  }

  const limits = resolveEquipmentPurchaseQuantityLimits({
    equipment,
    sourceMode: purchase.sourceMode,
    origin: purchase.origin,
    budget,
    currentQuantity: purchase.quantity,
    isPurchaseRow: true,
  })

  if (!limits.editable) {
    return {
      status: 'invalid',
      issues: [{ code: 'quantity_not_editable', reference: { purchaseId } }],
    }
  }

  const nextQuantity = clampEquipmentPurchaseQuantity(quantity, limits.max)
  const purchases = current.purchases.map((entry, index) =>
    index === purchaseIndex ? { ...entry, quantity: nextQuantity } : entry,
  )

  return {
    status: 'applied',
    patch: {
      equipment: {
        ...current,
        purchases,
      },
    },
  }
}

function applyRemovePurchaseQuantityAction(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  purchaseId: string
  quantity: number
  budget?: EquipmentBudgetSummary
}): EquipmentStepActionResult {
  const { draft, catalogIndex, purchaseId, quantity, budget } = args
  const current = draft.equipment
  if (!current) {
    return { status: 'invalid', issues: [{ code: 'equipment_channel_missing' }] }
  }

  const purchaseIndex = resolveEquipmentPurchaseIndex(current.purchases, purchaseId)
  if (purchaseIndex === undefined) {
    return {
      status: 'invalid',
      issues: [{ code: 'purchase_not_found', reference: { purchaseId } }],
    }
  }

  const purchase = current.purchases[purchaseIndex]
  if (!purchase) {
    return {
      status: 'invalid',
      issues: [{ code: 'purchase_not_found', reference: { purchaseId } }],
    }
  }

  if (quantity >= purchase.quantity) {
    return applyRemoveEntryAction({
      draft,
      target: { kind: 'purchase', purchaseId },
    })
  }

  return applySetPurchaseQuantityAction({
    draft,
    catalogIndex,
    purchaseId,
    quantity: purchase.quantity - quantity,
    budget,
  })
}

function dispatchEquipmentStepAction(
  action: EquipmentStepAction,
  args: {
    draft: CharacterBuilderDraft
    catalogIndex: CharacterBuildCatalogIndex
    budget?: EquipmentBudgetSummary
    acquisitionContext?: EquipmentAcquisitionBuilderContext
  },
): EquipmentStepActionResult {
  switch (action.kind) {
    case 'set_purchase_quantity':
      return applySetPurchaseQuantityAction({
        ...args,
        purchaseId: action.purchaseId,
        quantity: action.quantity,
      })
    case 'skip_starting_equipment':
      return applySkipStartingEquipmentAction()
    case 'select_package':
      return applySelectPackageAction({
        draft: args.draft,
        catalogIndex: args.catalogIndex,
        optionId: action.optionId,
        choiceSetId: action.choiceSetId,
        nestedSelections: action.nestedSelections,
      })
    case 'add_purchase':
      return applyAddPurchaseAction({
        ...args,
        equipmentId: action.equipmentId,
        sourceMode: action.sourceMode,
        quantity: action.quantity ?? 1,
      })
    case 'remove_entry':
      return applyRemoveEntryAction({
        draft: args.draft,
        target: action.target,
      })
    case 'acquire_magic_item':
      return applyAcquireMagicItemAction({
        ...args,
        equipmentId: action.equipmentId,
        requestedQuantity: action.requestedQuantity,
      })
    case 'apply_purchase_intent':
      return applyPurchaseIntentAction({
        ...args,
        equipmentId: action.equipmentId,
        requestedQuantity: action.requestedQuantity,
      })
    case 'release_magic_item_grant':
      return applyReleaseMagicItemGrantAction({
        draft: args.draft,
        allowanceId: action.allowanceId,
        equipmentId: action.equipmentId,
        quantity: action.quantity,
      })
    case 'remove_purchase_quantity':
      return applyRemovePurchaseQuantityAction({
        ...args,
        purchaseId: action.purchaseId,
        quantity: action.quantity,
      })
    default: {
      const _exhaustive: never = action
      return _exhaustive
    }
  }
}

export function applyEquipmentStepAction(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  action: EquipmentStepAction
  budget?: EquipmentBudgetSummary
  acquisitionContext?: EquipmentAcquisitionBuilderContext
}): EquipmentStepActionResult {
  return dispatchEquipmentStepAction(args.action, args)
}

export type { EquipmentStepActionIssue }
