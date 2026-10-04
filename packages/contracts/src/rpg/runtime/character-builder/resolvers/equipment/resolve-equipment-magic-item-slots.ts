import type { MagicItemRarity } from '../../../../vocab/magic-item/rarity'
import type {
  MagicItemAllowance,
  MagicItemGrantProgress,
} from '../../equipment/magic-item-selection'

export type EquipmentMagicItemSlotRarityMode = 'exact' | 'maximum'

export type EquipmentMagicItemSlot = {
  rarity: MagicItemRarity
  rarityMode: EquipmentMagicItemSlotRarityMode
  quantity: number
  remaining: number
  /** Display-only exhaustion. Not written back onto the allowance. */
  fulfilled: boolean
}

function rarityModeForAllowance(
  requirement: MagicItemAllowance['requirement'],
): EquipmentMagicItemSlotRarityMode {
  return requirement === 'up_to' ? 'maximum' : 'exact'
}

/**
 * Aggregates canonical grant progress into display slots.
 * Group key is rarity mode plus rarity so exact and maximum rows stay distinct.
 */
export function resolveEquipmentMagicItemSlots(args: {
  allowances: readonly MagicItemAllowance[]
  progress: readonly MagicItemGrantProgress[]
}): EquipmentMagicItemSlot[] {
  const progressById = new Map(args.progress.map((entry) => [entry.allowanceId, entry]))
  const groups = new Map<string, EquipmentMagicItemSlot>()
  const order: string[] = []

  for (const allowance of args.allowances) {
    const rarityMode = rarityModeForAllowance(allowance.requirement)
    const key = `${rarityMode}:${allowance.rarity}`
    const remaining = progressById.get(allowance.id)?.remainingCapacity ?? allowance.count
    const existing = groups.get(key)

    if (!existing) {
      order.push(key)
      groups.set(key, {
        rarity: allowance.rarity,
        rarityMode,
        quantity: allowance.count,
        remaining,
        fulfilled: false,
      })
      continue
    }

    existing.quantity += allowance.count
    existing.remaining += remaining
  }

  return order.map((key) => {
    const slot = groups.get(key)!
    return { ...slot, fulfilled: slot.remaining === 0 }
  })
}
