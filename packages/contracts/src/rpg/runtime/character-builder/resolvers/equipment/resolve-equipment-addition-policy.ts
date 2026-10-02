import type { Equipment } from '../../../../content/equipment'
import { isEquipmentStackable } from '../../../../content/equipment/stackable'

export const EQUIPMENT_ADDITION_POLICIES = ['single', 'quantity'] as const

export type EquipmentAdditionPolicy = (typeof EQUIPMENT_ADDITION_POLICIES)[number]

export type EquipmentAdditionContext =
  | { kind: 'grant' }
  | { kind: 'inventory' }
  | { kind: 'acquisition'; blocked: boolean }
  | { kind: 'requirement'; idempotentClassedWeapon: boolean }

/**
 * Whether another copy of an equipment option may be added.
 * Callers use this policy instead of {@link isEquipmentStackable}.
 */
export function resolveEquipmentAdditionPolicy(args: {
  equipment: Equipment
  context: EquipmentAdditionContext
}): EquipmentAdditionPolicy {
  if (args.context.kind === 'acquisition' && args.context.blocked) return 'single'
  if (args.context.kind === 'requirement' && args.context.idempotentClassedWeapon) return 'single'
  return isEquipmentStackable(args.equipment) ? 'quantity' : 'single'
}
