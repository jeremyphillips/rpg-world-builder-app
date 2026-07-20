import type { MagicItemAllowance, MagicItemGrantProgress } from '../../magic-item-selection'
import type { EquipmentAcquisitionGrantAllocation } from './equipment-acquisition-types'

export function allocateMagicItemGrantQuantity(args: {
  requestedQuantity: number
  matchingAllowances: readonly MagicItemAllowance[]
  progress: readonly MagicItemGrantProgress[]
}): {
  grantAllocations: EquipmentAcquisitionGrantAllocation[]
  remainingQuantity: number
  missingGrant: boolean
} {
  const grantAllocations: EquipmentAcquisitionGrantAllocation[] = []
  let remaining = args.requestedQuantity

  for (const allowance of args.matchingAllowances) {
    if (remaining <= 0) break

    const entry = args.progress.find((row) => row.allowanceId === allowance.id)
    const capacity = entry?.remainingCapacity ?? allowance.count
    if (capacity <= 0) continue

    const quantity = Math.min(remaining, capacity)
    grantAllocations.push({ allowanceId: allowance.id, quantity })
    remaining -= quantity
  }

  return {
    grantAllocations,
    remainingQuantity: remaining,
    missingGrant: remaining > 0 && args.matchingAllowances.length === 0,
  }
}
