import {
  resolveEquipmentMagicItemSlots,
  type EquipmentBudgetSummary,
  type EquipmentMagicItemSlot,
  type MagicItemAllowance,
  type MagicItemGrantProgress,
} from '@rpg/contracts'

import {
  formatEquipmentBudgetGuidanceCopy,
  type EquipmentBudgetGuidanceCopy,
} from '../../acquisition/equipment-acquisition-guidance.lib'
import type { EquipmentPickerWorkflowMode } from '../../../../lib/equipment/equipment-step.lib'
import { EQUIPMENT_PICKER_MODE_MAGIC_ITEMS } from './equipment-picker-drawer.types'

export type EquipmentPickerHeaderResource =
  | {
      kind: 'currency'
      currency: EquipmentBudgetGuidanceCopy
    }
  | {
      kind: 'magicItems'
      slots: EquipmentMagicItemSlot[]
    }
  | undefined

export function resolveEquipmentPickerHeaderResource(args: {
  workflowMode: EquipmentPickerWorkflowMode
  budget?: EquipmentBudgetSummary
  magicItemAllowances?: readonly MagicItemAllowance[]
  magicItemGrantProgress?: readonly MagicItemGrantProgress[]
}): EquipmentPickerHeaderResource {
  if (args.workflowMode === EQUIPMENT_PICKER_MODE_MAGIC_ITEMS) {
    const slots = resolveEquipmentMagicItemSlots({
      allowances: args.magicItemAllowances ?? [],
      progress: args.magicItemGrantProgress ?? [],
    })
    if (slots.length === 0) return undefined
    return { kind: 'magicItems', slots }
  }

  if (!args.budget) return undefined
  return {
    kind: 'currency',
    currency: formatEquipmentBudgetGuidanceCopy(args.budget),
  }
}
