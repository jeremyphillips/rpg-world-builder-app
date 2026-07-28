import type { Equipment } from '../../../../content/equipment'
import type { MagicItemRarity } from '../../../../vocab/magic-item/rarity'
import type {
  MagicItemAllowance,
  MagicItemAllowanceEligibility,
  MagicItemGrantProgress,
  MagicItemGrantReadiness,
  MagicItemGrantSelection,
  MagicItemSelectionIssue,
} from '../../equipment/magic-item-selection'
import { resolveMagicItemDuplicatePolicy } from './resolve-magic-item-duplicate-policy'

export function resolveMagicItemGrantProgress(args: {
  allowance: MagicItemAllowance
  selections: readonly MagicItemGrantSelection[]
}): MagicItemGrantProgress {
  const { allowance, selections } = args
  const selected = selections
    .filter((row) => row.allowanceId === allowance.id)
    .reduce((sum, row) => sum + row.quantity, 0)

  return {
    allowanceId: allowance.id,
    rarity: allowance.rarity,
    capacity: allowance.count,
    selected,
    remainingCapacity: Math.max(0, allowance.count - selected),
    isFilled: selected >= allowance.count,
  }
}

export function resolveMagicItemGrantProgressList(args: {
  allowances: readonly MagicItemAllowance[]
  selections: readonly MagicItemGrantSelection[]
}): MagicItemGrantProgress[] {
  return args.allowances.map((allowance) =>
    resolveMagicItemGrantProgress({ allowance, selections: args.selections }),
  )
}

export function isMagicItemAllowanceSatisfied(
  allowance: MagicItemAllowance,
  progress: MagicItemGrantProgress,
): boolean {
  return allowance.requirement === 'up_to' || progress.selected === allowance.count
}

export function resolveMagicItemGrantReadiness(args: {
  allowances: readonly MagicItemAllowance[]
  progress: readonly MagicItemGrantProgress[]
}): MagicItemGrantReadiness {
  const progressById = new Map(args.progress.map((entry) => [entry.allowanceId, entry]))
  const issues: MagicItemGrantReadiness['issues'] = []

  for (const allowance of args.allowances) {
    const entry = progressById.get(allowance.id)
    if (!entry) continue
    if (isMagicItemAllowanceSatisfied(allowance, entry)) continue

    issues.push({
      allowanceId: allowance.id,
      rarity: allowance.rarity,
      remaining: allowance.count - entry.selected,
    })
  }

  return { complete: issues.length === 0, issues }
}

export function resolveMagicItemAllowanceEligibility(args: {
  equipment: Equipment
  allowance: MagicItemAllowance
  progress: MagicItemGrantProgress
}): MagicItemAllowanceEligibility {
  const { equipment, allowance, progress } = args

  if (equipment.kind !== 'magic_item') {
    return { eligible: false, reason: 'not_magic_item' }
  }

  if (!equipment.rarity || equipment.rarity !== allowance.rarity) {
    return { eligible: false, reason: 'rarity_mismatch' }
  }

  if (progress.remainingCapacity <= 0) {
    return { eligible: false, reason: 'allowance_full' }
  }

  return { eligible: true }
}

export function countOwnedQuantity(args: {
  equipmentId: string
  selections: readonly MagicItemGrantSelection[]
  purchaseQuantity?: number
}): number {
  const grantQuantity = args.selections
    .filter((row) => row.equipmentId === args.equipmentId)
    .reduce((sum, row) => sum + row.quantity, 0)

  return grantQuantity + (args.purchaseQuantity ?? 0)
}

export function wouldViolateDuplicatePolicy(args: {
  equipment: Equipment
  equipmentId: string
  selections: readonly MagicItemGrantSelection[]
  purchases: readonly { equipmentId: string; quantity: number }[]
  additionalQuantity: number
}): boolean {
  if (args.equipment.kind !== 'magic_item') return false
  if (resolveMagicItemDuplicatePolicy(args.equipment) === 'multiple') return false

  const owned =
    countOwnedQuantity({
      equipmentId: args.equipmentId,
      selections: args.selections,
    }) +
    args.purchases
      .filter((row) => row.equipmentId === args.equipmentId)
      .reduce((sum, row) => sum + row.quantity, 0)

  return owned + args.additionalQuantity > 1
}

export function resolveMagicItemSelectionIssues(args: {
  selections: readonly MagicItemGrantSelection[]
  allowances: readonly MagicItemAllowance[]
  catalogEquipment: ReadonlyMap<string, Equipment>
}): MagicItemSelectionIssue[] {
  const { selections, allowances, catalogEquipment } = args
  const allowanceById = new Map(allowances.map((entry) => [entry.id, entry]))
  const issues: MagicItemSelectionIssue[] = []

  for (const selection of selections) {
    const allowance = allowanceById.get(selection.allowanceId)
    if (!allowance) {
      issues.push({
        code: 'allowance_missing',
        allowanceId: selection.allowanceId,
        equipmentId: selection.equipmentId,
      })
      continue
    }

    const equipment = catalogEquipment.get(selection.equipmentId)
    if (!equipment) {
      issues.push({
        code: 'equipment_missing',
        allowanceId: selection.allowanceId,
        equipmentId: selection.equipmentId,
      })
      continue
    }

    if (equipment.kind !== 'magic_item') {
      issues.push({
        code: 'not_magic_item',
        allowanceId: selection.allowanceId,
        equipmentId: selection.equipmentId,
      })
      continue
    }

    if (!equipment.rarity || equipment.rarity !== allowance.rarity) {
      issues.push({
        code: 'rarity_mismatch',
        allowanceId: selection.allowanceId,
        equipmentId: selection.equipmentId,
      })
      continue
    }

    if (
      wouldViolateDuplicatePolicy({
        equipment,
        equipmentId: selection.equipmentId,
        selections: selections.filter(
          (row) =>
            !(
              row.allowanceId === selection.allowanceId && row.equipmentId === selection.equipmentId
            ),
        ),
        purchases: [],
        additionalQuantity: selection.quantity,
      })
    ) {
      issues.push({
        code: 'duplicate_not_allowed',
        allowanceId: selection.allowanceId,
        equipmentId: selection.equipmentId,
      })
    }
  }

  const progress = resolveMagicItemGrantProgressList({ allowances, selections })
  for (const entry of progress) {
    if (entry.selected > entry.capacity) {
      issues.push({ code: 'allowance_overfilled', allowanceId: entry.allowanceId })
    }
  }

  return issues
}

export function matchingAllowancesForRarity(
  allowances: readonly MagicItemAllowance[],
  rarity: MagicItemRarity,
): MagicItemAllowance[] {
  return allowances.filter((allowance) => allowance.rarity === rarity)
}

export function totalSelectedForEquipment(
  selections: readonly MagicItemGrantSelection[],
  equipmentId: string,
): number {
  return selections
    .filter((row) => row.equipmentId === equipmentId)
    .reduce((sum, row) => sum + row.quantity, 0)
}

export function readMagicItemSelections(draft: {
  equipment?: { magicItemSelections?: readonly MagicItemGrantSelection[] }
}): MagicItemGrantSelection[] {
  return [...(draft.equipment?.magicItemSelections ?? [])]
}
