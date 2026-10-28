import { describe, expect, it, vi } from 'vitest'

import { resolveVisibleEquipmentPickerWorkflowSwitcher } from './equipment-picker-workflow-switcher.lib'
import type { EquipmentPickerWorkflowSwitcher } from './equipment-picker-drawer.types'

function switcher(
  modes: EquipmentPickerWorkflowSwitcher['modes'],
): EquipmentPickerWorkflowSwitcher {
  return { modes, onChange: vi.fn() }
}

describe('resolveVisibleEquipmentPickerWorkflowSwitcher', () => {
  it('keeps a missing switcher fixed', () => {
    expect(resolveVisibleEquipmentPickerWorkflowSwitcher({ workflowMode: 'purchase' })).toBeNull()
  })

  it('keeps a single mode fixed', () => {
    expect(
      resolveVisibleEquipmentPickerWorkflowSwitcher({
        workflowMode: 'magic_items',
        workflowSwitcher: switcher(['magic_items']),
      }),
    ).toBeNull()
  })

  it('returns a two-mode switcher that includes the active mode', () => {
    const workflowSwitcher = switcher(['purchase', 'magic_items'])
    expect(
      resolveVisibleEquipmentPickerWorkflowSwitcher({
        workflowMode: 'purchase',
        workflowSwitcher,
      }),
    ).toBe(workflowSwitcher)
  })

  it('hides duplicate modes', () => {
    expect(
      resolveVisibleEquipmentPickerWorkflowSwitcher({
        workflowMode: 'purchase',
        workflowSwitcher: switcher(['purchase', 'purchase']),
      }),
    ).toBeNull()
  })

  it('hides a switcher that does not include the active mode', () => {
    expect(
      resolveVisibleEquipmentPickerWorkflowSwitcher({
        workflowMode: 'loadout',
        workflowSwitcher: switcher(['purchase', 'magic_items']),
      }),
    ).toBeNull()
  })
})
