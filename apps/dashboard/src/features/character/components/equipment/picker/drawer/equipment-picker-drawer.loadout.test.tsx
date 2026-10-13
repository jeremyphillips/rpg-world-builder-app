import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { EquipmentPickerDrawer } from './equipment-picker-drawer'
import { equipmentPickerItemsFixture } from './equipment-picker-drawer.fixtures'
import { EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL } from './equipment-picker-drawer.types'

describe('EquipmentPickerDrawer loadout mode', () => {
  it('renders Add equipment heading without purchase budget filters', () => {
    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[equipmentPickerItemsFixture[0]!]}
        workflowMode="loadout"
        resolveRowActionViewModel={() => ({
          kind: 'loadout',
          ownedQuantity: 0,
          plainQuantity: 0,
          customizedQuantity: 0,
        })}
        onCommitAdd={vi.fn()}
        onSetRowQuantity={vi.fn()}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Add equipment' })).toBeInTheDocument()
    expect(screen.queryByText(EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL)).not.toBeInTheDocument()
  })
})
