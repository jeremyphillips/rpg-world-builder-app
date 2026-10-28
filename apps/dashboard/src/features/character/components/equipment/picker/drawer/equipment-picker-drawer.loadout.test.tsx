import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { EquipmentPickerDrawer } from './equipment-picker-drawer'
import {
  equipmentPickerChainMailFixture,
  equipmentPickerItemsFixture,
  equipmentPickerLongswordFixture,
} from './equipment-picker-drawer.fixtures'
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

  it('renders Owned once for a plain stack and adds customized metadata without a purchase price', () => {
    const { rerender } = render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[equipmentPickerItemsFixture[0]!]}
        workflowMode="loadout"
        resolveRowActionViewModel={() => ({
          kind: 'loadout',
          ownedQuantity: 1,
          plainQuantity: 1,
          customizedQuantity: 0,
        })}
        onCommitAdd={vi.fn()}
        onSetRowQuantity={vi.fn()}
      />,
    )
    expect(screen.getAllByText('Owned')).toHaveLength(1)
    expect(screen.queryByText('Purchased')).not.toBeInTheDocument()

    rerender(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[equipmentPickerItemsFixture[0]!]}
        workflowMode="loadout"
        resolveRowActionViewModel={() => ({
          kind: 'loadout',
          ownedQuantity: 2,
          plainQuantity: 1,
          customizedQuantity: 1,
        })}
        onCommitAdd={vi.fn()}
        onSetRowQuantity={vi.fn()}
      />,
    )
    expect(screen.getByText('Owned')).toBeInTheDocument()
    expect(screen.getByText('1 customized')).toBeInTheDocument()
    expect(screen.queryByText('Owned · Owned')).not.toBeInTheDocument()
  })

  it('commits a single radio choice from the footer without row details', async () => {
    const user = userEvent.setup()
    const items = equipmentPickerItemsFixture.slice(0, 2)
    function Host() {
      const [value, setValue] = useState<string | null>(equipmentPickerLongswordFixture.id)
      const [committed, setCommitted] = useState<string | null>(null)
      return (
        <>
          <EquipmentPickerDrawer
            open
            onOpenChange={vi.fn()}
            title="Select armor"
            items={items}
            workflowMode="loadout"
            selection={{ value, onValueChange: setValue }}
            footer={
              <button
                type="button"
                disabled={value === equipmentPickerLongswordFixture.id}
                onClick={() => setCommitted(value)}
              >
                Select armor
              </button>
            }
            onCommitAdd={vi.fn()}
          />
          <div data-testid="committed">{committed}</div>
        </>
      )
    }

    render(<Host />)
    const group = screen.getByRole('radiogroup', { name: 'Select armor' })
    const radios = within(group).getAllByRole('radio')
    expect(radios).toHaveLength(2)
    expect(
      within(group).getByRole('radio', { name: equipmentPickerLongswordFixture.name }),
    ).toBeChecked()
    expect(within(group).queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select armor' })).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: equipmentPickerChainMailFixture.name }))
    await user.click(screen.getByRole('button', { name: 'Select armor' }))
    expect(screen.getByTestId('committed')).toHaveTextContent(equipmentPickerChainMailFixture.id)
  })
})
