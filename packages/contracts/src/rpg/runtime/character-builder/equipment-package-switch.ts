import { isEquipmentStackable } from '../../content/equipment/stackable'
import { characterWealthFromGrant } from '../character/equipment-inventory'
import type { CharacterBuildCatalogIndex } from './context'
import type {
  CharacterBuilderDraft,
  CharacterBuilderDraftEquipmentPurchase,
  NormalizedCharacterBuilderDraftEquipmentPurchase,
} from './draft'
import {
  normalizeCharacterBuilderDraftPurchases,
  normalizeEquipmentPurchase,
  resolveEquipmentPurchaseId,
  resolveEquipmentPurchaseIndex,
} from './equipment-purchase'
import { wealthToCopper } from './resolvers/equipment/equipment-budget'
import {
  resolveEquipmentPurchasePricing,
  type EquipmentPurchasePricing,
} from './resolvers/equipment/resolve-equipment-purchase-pricing'
import { startingEquipmentChoiceSetId } from './resolvers/equipment/resolve-starting-equipment-choice-sets'
import { STARTING_EQUIPMENT_GOLD_OPTION_ID } from './starting-package-conversion'

export type EquipmentPackageSwitchInventorySnapshot = {
  purchases: ReadonlyArray<{
    purchaseId: string
    quantity: number
    equipmentId: string
  }>
}

export type EquipmentPackageSwitchBlockingReason =
  | { kind: 'nonEditableOverBudget'; nonEditableRetainedCostCp: number; targetAllowanceCp: number }
  | {
      kind: 'staleCommittedInventory'
      expected: EquipmentPackageSwitchInventorySnapshot
      actual: EquipmentPackageSwitchInventorySnapshot
    }
  | { kind: 'draftOverBudget'; amountOverBudgetCp: number }
  | {
      kind: 'invalidDraftQuantity'
      purchaseId: string
      committedQuantity: number
      draftQuantity: number
    }
  | { kind: 'missingTargetOption' }
  | { kind: 'missingPurchase'; purchaseId: string }

export type EquipmentPackageSwitchItem = {
  purchaseId: string
  equipmentId: string
  equipmentName: string
  committedQuantity: number
  unitCostCp: number
  editable: boolean
  isStackable: boolean
  pricing: EquipmentPurchasePricing
}

export type EquipmentPackageSwitchBudget = {
  targetAllowanceCp: number
  totalRetainedCostCp: number
  nonEditableRetainedCostCp: number
  editableRetainedCostCp: number
  draftEditableCostCp: number
  draftTotalCostCp: number
  amountOverBudgetCp: number
  remainingAllowanceCp: number
  initialAmountOverBudgetCp: number
  isDraftValid: boolean
}

export type EquipmentPackageSwitchStatus = 'noConflict' | 'resolvable' | 'blocked'

export type EquipmentPackageSwitchEvaluation = {
  targetOptionId: string
  targetOptionLabel: string
  status: EquipmentPackageSwitchStatus
  budget: EquipmentPackageSwitchBudget
  items: EquipmentPackageSwitchItem[]
  editableItems: EquipmentPackageSwitchItem[]
  blockingReason?: EquipmentPackageSwitchBlockingReason
}

export type EquipmentPackageSwitchCommitResult =
  | { status: 'success'; patch: Partial<CharacterBuilderDraft> }
  | { status: 'failure'; commitError: EquipmentPackageSwitchBlockingReason }

type ResolvedPurchaseRow = {
  purchase: NormalizedCharacterBuilderDraftEquipmentPurchase
  purchaseId: string
  item: EquipmentPackageSwitchItem
}

function isPackageSwitchPurchaseEditable(
  purchase: CharacterBuilderDraftEquipmentPurchase,
  equipment: { kind: string } & Parameters<typeof isEquipmentStackable>[0],
): boolean {
  if (purchase.sourceMode !== 'startingGold') return false
  if (purchase.origin === 'packageConversion' && !isEquipmentStackable(equipment)) {
    return false
  }
  return true
}

function resolvePurchaseRows(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): ResolvedPurchaseRow[] {
  const normalizedDraft = normalizeCharacterBuilderDraftPurchases(draft)
  const purchases = normalizedDraft.equipment?.purchases ?? []

  return purchases.flatMap((purchase, index) => {
    const equipment = catalogIndex.equipment.get(purchase.equipmentId)
    if (!equipment) return []

    const pricing = resolveEquipmentPurchasePricing(equipment)
    const unitCostCp = pricing.status === 'unavailable' ? 0 : pricing.unitCostCp
    const normalizedPurchase = normalizeEquipmentPurchase(purchases, index)
    const purchaseId = resolveEquipmentPurchaseId(purchases, index)
    const editable = isPackageSwitchPurchaseEditable(normalizedPurchase, equipment)

    return [
      {
        purchase: normalizedPurchase,
        purchaseId,
        item: {
          purchaseId,
          equipmentId: normalizedPurchase.equipmentId,
          equipmentName: equipment.name,
          committedQuantity: normalizedPurchase.quantity,
          unitCostCp,
          editable,
          isStackable: isEquipmentStackable(equipment),
          pricing,
        },
      },
    ]
  })
}

function sortSnapshotPurchases(
  purchases: EquipmentPackageSwitchInventorySnapshot['purchases'],
): EquipmentPackageSwitchInventorySnapshot['purchases'] {
  return [...purchases].sort((left, right) => left.purchaseId.localeCompare(right.purchaseId))
}

export function createEquipmentPackageSwitchInventorySnapshot(
  draft: CharacterBuilderDraft,
): EquipmentPackageSwitchInventorySnapshot {
  const normalizedDraft = normalizeCharacterBuilderDraftPurchases(draft)
  const purchases = normalizedDraft.equipment?.purchases ?? []

  return {
    purchases: purchases.map((purchase, index) => ({
      purchaseId: resolveEquipmentPurchaseId(purchases, index),
      quantity: purchase.quantity,
      equipmentId: purchase.equipmentId,
    })),
  }
}

export function equipmentPackageSwitchSnapshotsEqual(
  left: EquipmentPackageSwitchInventorySnapshot,
  right: EquipmentPackageSwitchInventorySnapshot,
): boolean {
  const sortedLeft = sortSnapshotPurchases(left.purchases)
  const sortedRight = sortSnapshotPurchases(right.purchases)

  if (sortedLeft.length !== sortedRight.length) return false

  return sortedLeft.every((entry, index) => {
    const other = sortedRight[index]!
    return (
      entry.purchaseId === other.purchaseId &&
      entry.quantity === other.quantity &&
      entry.equipmentId === other.equipmentId
    )
  })
}

function resolveDraftQuantity(
  item: EquipmentPackageSwitchItem,
  draftQuantitiesByPurchaseId: Record<string, number> | undefined,
): number {
  const draftQuantity = draftQuantitiesByPurchaseId?.[item.purchaseId]
  return draftQuantity ?? item.committedQuantity
}

function buildBudget(args: {
  targetAllowanceCp: number
  rows: ResolvedPurchaseRow[]
  draftQuantitiesByPurchaseId?: Record<string, number>
  blockingReason?: EquipmentPackageSwitchBlockingReason
}): EquipmentPackageSwitchBudget {
  const { targetAllowanceCp, rows, draftQuantitiesByPurchaseId, blockingReason } = args

  let totalRetainedCostCp = 0
  let nonEditableRetainedCostCp = 0

  for (const row of rows) {
    const lineCost = row.item.unitCostCp * row.item.committedQuantity
    totalRetainedCostCp += lineCost
    if (!row.item.editable) {
      nonEditableRetainedCostCp += lineCost
    }
  }

  const editableRetainedCostCp = totalRetainedCostCp - nonEditableRetainedCostCp
  const initialAmountOverBudgetCp = Math.max(0, totalRetainedCostCp - targetAllowanceCp)

  let draftEditableCostCp = 0
  for (const row of rows) {
    if (!row.item.editable) continue
    const draftQuantity = resolveDraftQuantity(row.item, draftQuantitiesByPurchaseId)
    draftEditableCostCp += row.item.unitCostCp * draftQuantity
  }

  const draftTotalCostCp = nonEditableRetainedCostCp + draftEditableCostCp
  const amountOverBudgetCp = Math.max(0, draftTotalCostCp - targetAllowanceCp)
  const remainingAllowanceCp = Math.max(0, targetAllowanceCp - draftTotalCostCp)
  const isDraftValid = amountOverBudgetCp === 0 && blockingReason === undefined

  return {
    targetAllowanceCp,
    totalRetainedCostCp,
    nonEditableRetainedCostCp,
    editableRetainedCostCp,
    draftEditableCostCp,
    draftTotalCostCp,
    amountOverBudgetCp,
    remainingAllowanceCp,
    initialAmountOverBudgetCp,
    isDraftValid,
  }
}

function validateDraftQuantities(
  editableItems: EquipmentPackageSwitchItem[],
  draftQuantitiesByPurchaseId: Record<string, number> | undefined,
): EquipmentPackageSwitchBlockingReason | undefined {
  if (!draftQuantitiesByPurchaseId) return undefined

  for (const item of editableItems) {
    const draftQuantity = draftQuantitiesByPurchaseId[item.purchaseId]
    if (draftQuantity === undefined) continue

    if (
      !Number.isInteger(draftQuantity) ||
      draftQuantity < 0 ||
      draftQuantity > item.committedQuantity
    ) {
      return {
        kind: 'invalidDraftQuantity',
        purchaseId: item.purchaseId,
        committedQuantity: item.committedQuantity,
        draftQuantity,
      }
    }
  }

  return undefined
}

function createPackageSwitchEvaluation(args: {
  targetOptionId: string
  targetOptionLabel: string
  status: EquipmentPackageSwitchStatus
  rows: ResolvedPurchaseRow[]
  targetAllowanceCp: number
  draftQuantitiesByPurchaseId?: Record<string, number>
  blockingReason?: EquipmentPackageSwitchBlockingReason
}): EquipmentPackageSwitchEvaluation {
  const items = args.rows.map((row) => row.item)
  const editableItems = items.filter((item) => item.editable)

  return {
    targetOptionId: args.targetOptionId,
    targetOptionLabel: args.targetOptionLabel,
    status: args.status,
    budget: buildBudget({
      targetAllowanceCp: args.targetAllowanceCp,
      rows: args.rows,
      draftQuantitiesByPurchaseId: args.draftQuantitiesByPurchaseId,
      blockingReason: args.blockingReason,
    }),
    items,
    editableItems,
    blockingReason: args.blockingReason,
  }
}

function resolveResolvableBlockingReason(
  budget: EquipmentPackageSwitchBudget,
  draftQuantitiesByPurchaseId?: Record<string, number>,
): EquipmentPackageSwitchBlockingReason | undefined {
  if (budget.amountOverBudgetCp > 0 && draftQuantitiesByPurchaseId) {
    return budget.isDraftValid
      ? undefined
      : { kind: 'draftOverBudget', amountOverBudgetCp: budget.amountOverBudgetCp }
  }

  return undefined
}

function resolvePackageSwitchStatus(args: {
  rows: ResolvedPurchaseRow[]
  targetAllowanceCp: number
  draftQuantitiesByPurchaseId?: Record<string, number>
}): Pick<EquipmentPackageSwitchEvaluation, 'status' | 'blockingReason'> {
  const nonEditableCostCp = nonEditableRetainedCostCpFromRows(args.rows)

  if (nonEditableCostCp > args.targetAllowanceCp) {
    return {
      status: 'blocked',
      blockingReason: {
        kind: 'nonEditableOverBudget',
        nonEditableRetainedCostCp: nonEditableCostCp,
        targetAllowanceCp: args.targetAllowanceCp,
      },
    }
  }

  const budget = buildBudget({
    targetAllowanceCp: args.targetAllowanceCp,
    rows: args.rows,
    draftQuantitiesByPurchaseId: args.draftQuantitiesByPurchaseId,
  })

  if (budget.totalRetainedCostCp <= args.targetAllowanceCp) {
    return { status: 'noConflict' }
  }

  return {
    status: 'resolvable',
    blockingReason: resolveResolvableBlockingReason(budget, args.draftQuantitiesByPurchaseId),
  }
}

function buildPackageSwitchSelectionPatch(args: {
  draft: CharacterBuilderDraft
  targetOptionId: string
  choiceSetId: string
  nestedSelections: CharacterBuilderDraft['choiceSelections']
  purchases: CharacterBuilderDraftEquipmentPurchase[]
}): Partial<CharacterBuilderDraft> {
  const isGold = args.targetOptionId === STARTING_EQUIPMENT_GOLD_OPTION_ID

  return {
    choiceSelections: {
      ...args.draft.choiceSelections,
      ...args.nestedSelections,
      [args.choiceSetId]: [args.targetOptionId],
    },
    equipment: {
      mode: isGold ? 'gold' : 'package',
      purchases: args.purchases,
      removedPackageItemKeys: [],
      customized: args.draft.equipment?.customized ?? false,
      skipped: false,
    },
  }
}

export function evaluateEquipmentPackageSwitch(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  targetOptionId: string
  nestedSelections?: CharacterBuilderDraft['choiceSelections']
  draftQuantitiesByPurchaseId?: Record<string, number>
  committedInventorySnapshot?: EquipmentPackageSwitchInventorySnapshot
}): EquipmentPackageSwitchEvaluation | undefined {
  const classId = args.draft.class.classId
  if (!classId) return undefined

  const characterClass = args.catalogIndex.classes.get(classId)
  const startingEquipment = characterClass?.characterCreation?.startingEquipment
  const targetOption = startingEquipment?.options.find((entry) => entry.id === args.targetOptionId)

  if (!targetOption) {
    return createPackageSwitchEvaluation({
      targetOptionId: args.targetOptionId,
      targetOptionLabel: args.targetOptionId,
      status: 'blocked',
      rows: [],
      targetAllowanceCp: 0,
      draftQuantitiesByPurchaseId: args.draftQuantitiesByPurchaseId,
      blockingReason: { kind: 'missingTargetOption' },
    })
  }

  const targetAllowanceCp = wealthToCopper(characterWealthFromGrant(targetOption.wealth))
  const rows = resolvePurchaseRows(args.draft, args.catalogIndex)

  if (args.committedInventorySnapshot) {
    const actualSnapshot = createEquipmentPackageSwitchInventorySnapshot(args.draft)
    if (!equipmentPackageSwitchSnapshotsEqual(args.committedInventorySnapshot, actualSnapshot)) {
      return createPackageSwitchEvaluation({
        targetOptionId: args.targetOptionId,
        targetOptionLabel: targetOption.label,
        status: 'resolvable',
        rows,
        targetAllowanceCp,
        draftQuantitiesByPurchaseId: args.draftQuantitiesByPurchaseId,
        blockingReason: {
          kind: 'staleCommittedInventory',
          expected: args.committedInventorySnapshot,
          actual: actualSnapshot,
        },
      })
    }
  }

  const invalidDraftReason = validateDraftQuantities(
    rows.filter((row) => row.item.editable).map((row) => row.item),
    args.draftQuantitiesByPurchaseId,
  )
  if (invalidDraftReason) {
    return createPackageSwitchEvaluation({
      targetOptionId: args.targetOptionId,
      targetOptionLabel: targetOption.label,
      status: 'resolvable',
      rows,
      targetAllowanceCp,
      draftQuantitiesByPurchaseId: args.draftQuantitiesByPurchaseId,
      blockingReason: invalidDraftReason,
    })
  }

  const { status, blockingReason } = resolvePackageSwitchStatus({
    rows,
    targetAllowanceCp,
    draftQuantitiesByPurchaseId: args.draftQuantitiesByPurchaseId,
  })

  return createPackageSwitchEvaluation({
    targetOptionId: args.targetOptionId,
    targetOptionLabel: targetOption.label,
    status,
    rows,
    targetAllowanceCp,
    draftQuantitiesByPurchaseId: args.draftQuantitiesByPurchaseId,
    blockingReason,
  })
}

function nonEditableRetainedCostCpFromRows(rows: ResolvedPurchaseRow[]): number {
  return rows.reduce((total, row) => {
    if (row.item.editable) return total
    return total + row.item.unitCostCp * row.item.committedQuantity
  }, 0)
}

export function buildEquipmentPackageSwitchPreview(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  targetOptionId: string
  nestedSelections?: CharacterBuilderDraft['choiceSelections']
}): EquipmentPackageSwitchEvaluation | undefined {
  return evaluateEquipmentPackageSwitch(args)
}

export function canSwitchEquipmentPackage(args: {
  evaluation: EquipmentPackageSwitchEvaluation
  draftQuantitiesByPurchaseId?: Record<string, number>
}): boolean {
  if (args.evaluation.status === 'noConflict') return true
  if (args.evaluation.status === 'blocked') return false

  const evaluation = args.draftQuantitiesByPurchaseId
    ? {
        ...args.evaluation,
        budget: args.evaluation.budget,
      }
    : args.evaluation

  return evaluation.budget.isDraftValid && !args.evaluation.blockingReason
}

function applyDraftPurchaseChanges(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  draftQuantitiesByPurchaseId: Record<string, number>
}): CharacterBuilderDraftEquipmentPurchase[] | undefined {
  const normalizedDraft = normalizeCharacterBuilderDraftPurchases(args.draft)
  const purchases = normalizedDraft.equipment?.purchases ?? []
  const rows = resolvePurchaseRows(args.draft, args.catalogIndex)
  let nextPurchases = [...purchases]
  let changed = false

  for (const row of rows) {
    if (!row.item.editable) continue

    const draftQuantity = args.draftQuantitiesByPurchaseId[row.purchaseId]
    if (draftQuantity === undefined) continue

    const purchaseIndex = resolveEquipmentPurchaseIndex(nextPurchases, row.purchaseId)
    if (purchaseIndex === undefined) {
      return undefined
    }

    if (draftQuantity === 0) {
      nextPurchases = nextPurchases.filter((_, index) => index !== purchaseIndex)
      changed = true
      continue
    }

    const current = nextPurchases[purchaseIndex]!
    if (current.quantity !== draftQuantity) {
      nextPurchases[purchaseIndex] = { ...current, quantity: draftQuantity }
      changed = true
    }
  }

  return changed ? nextPurchases : purchases
}

export function buildEquipmentPackageSwitchPatch(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  targetOptionId: string
  choiceSetId: string
  nestedSelections: CharacterBuilderDraft['choiceSelections']
  draftQuantitiesByPurchaseId: Record<string, number>
  committedInventorySnapshot: EquipmentPackageSwitchInventorySnapshot
}): EquipmentPackageSwitchCommitResult {
  const evaluation = evaluateEquipmentPackageSwitch({
    draft: args.draft,
    catalogIndex: args.catalogIndex,
    targetOptionId: args.targetOptionId,
    nestedSelections: args.nestedSelections,
    draftQuantitiesByPurchaseId: args.draftQuantitiesByPurchaseId,
    committedInventorySnapshot: args.committedInventorySnapshot,
  })

  if (!evaluation) {
    return { status: 'failure', commitError: { kind: 'missingTargetOption' } }
  }

  if (evaluation.blockingReason) {
    return { status: 'failure', commitError: evaluation.blockingReason }
  }

  if (evaluation.status === 'noConflict') {
    return {
      status: 'success',
      patch: buildPackageSwitchSelectionPatch({
        draft: args.draft,
        targetOptionId: args.targetOptionId,
        choiceSetId: args.choiceSetId,
        nestedSelections: args.nestedSelections,
        purchases: args.draft.equipment?.purchases ?? [],
      }),
    }
  }

  if (!evaluation.budget.isDraftValid) {
    return {
      status: 'failure',
      commitError: {
        kind: 'draftOverBudget',
        amountOverBudgetCp: evaluation.budget.amountOverBudgetCp,
      },
    }
  }

  const nextPurchases = applyDraftPurchaseChanges({
    draft: args.draft,
    catalogIndex: args.catalogIndex,
    draftQuantitiesByPurchaseId: args.draftQuantitiesByPurchaseId,
  })

  if (!nextPurchases) {
    return { status: 'failure', commitError: { kind: 'missingPurchase', purchaseId: 'unknown' } }
  }

  return {
    status: 'success',
    patch: buildPackageSwitchSelectionPatch({
      draft: args.draft,
      targetOptionId: args.targetOptionId,
      choiceSetId: args.choiceSetId,
      nestedSelections: args.nestedSelections,
      purchases: nextPurchases,
    }),
  }
}

export function initPackageSwitchDraftQuantities(
  evaluation: EquipmentPackageSwitchEvaluation,
): Record<string, number> {
  const quantities: Record<string, number> = {}

  for (const item of evaluation.editableItems) {
    quantities[item.purchaseId] = item.committedQuantity
  }

  return quantities
}

export function rebuildPackageSwitchDraftQuantities(args: {
  previousDraftQuantities: Record<string, number>
  evaluation: EquipmentPackageSwitchEvaluation
}): Record<string, number> {
  const next: Record<string, number> = {}

  for (const item of args.evaluation.editableItems) {
    const previous = args.previousDraftQuantities[item.purchaseId]
    if (
      previous !== undefined &&
      Number.isInteger(previous) &&
      previous >= 0 &&
      previous <= item.committedQuantity
    ) {
      next[item.purchaseId] = previous
    } else {
      next[item.purchaseId] = item.committedQuantity
    }
  }

  return next
}

export { startingEquipmentChoiceSetId }
