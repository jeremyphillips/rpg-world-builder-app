import type { Equipment } from '../../../../content/equipment'
import { isEquipmentStackable } from '../../../../content/equipment/stackable'

export const EQUIPMENT_ADDITION_POLICIES = ['blocked', 'single', 'quantity'] as const

export type EquipmentAdditionPolicy = (typeof EQUIPMENT_ADDITION_POLICIES)[number]

export type EquipmentAdditionContext =
  | { kind: 'grant' }
  | { kind: 'inventory' }
  | { kind: 'acquisition'; blocked: boolean }

/**
 * Whether another copy of an equipment option may be added.
 * Equipment kind does not choose the result. Callers use this policy instead of
 * {@link isEquipmentStackable}. `blocked` forbids another copy even at quantity 0.
 */
export function resolveEquipmentAdditionPolicy(args: {
  equipment: Equipment
  context: EquipmentAdditionContext
}): EquipmentAdditionPolicy {
  if (args.context.kind === 'acquisition' && args.context.blocked) return 'blocked'
  return isEquipmentStackable(args.equipment) ? 'quantity' : 'single'
}
