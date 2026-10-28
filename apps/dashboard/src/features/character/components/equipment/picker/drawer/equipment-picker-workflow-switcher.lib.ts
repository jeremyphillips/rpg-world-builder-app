import type { EquipmentPickerWorkflowMode } from '../../../../lib/equipment/equipment-step.lib'
import type { EquipmentPickerWorkflowSwitcher } from './equipment-picker-drawer.types'

const EQUIPMENT_PICKER_WORKFLOW_MODES = ['purchase', 'magic_items', 'loadout'] as const

function isEquipmentPickerWorkflowMode(value: string): value is EquipmentPickerWorkflowMode {
  return (EQUIPMENT_PICKER_WORKFLOW_MODES as readonly string[]).includes(value)
}

/**
 * The existing two-option segment. A missing switcher, a single mode, duplicate
 * modes, or an active mode outside the pair all leave the workflow fixed.
 */
export function resolveVisibleEquipmentPickerWorkflowSwitcher(args: {
  workflowMode: EquipmentPickerWorkflowMode
  workflowSwitcher?: EquipmentPickerWorkflowSwitcher
}): EquipmentPickerWorkflowSwitcher | null {
  const switcher = args.workflowSwitcher
  if (!switcher || switcher.modes.length !== 2) return null

  const [first, second] = switcher.modes
  if (!first || !second || first === second) return null
  if (!isEquipmentPickerWorkflowMode(first) || !isEquipmentPickerWorkflowMode(second)) return null
  if (first !== args.workflowMode && second !== args.workflowMode) return null

  return switcher
}
