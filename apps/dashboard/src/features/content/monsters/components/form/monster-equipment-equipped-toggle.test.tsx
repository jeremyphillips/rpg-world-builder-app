import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { MonsterEquipmentEquippedToggle } from './monster-equipment-equipped-toggle'

describe('MonsterEquipmentEquippedToggle', () => {
  it('keeps checked data-state on the checkbox when wrapped by the tooltip trigger', () => {
    render(
      <MonsterEquipmentEquippedToggle
        displayName="Battleaxe"
        checked
        onCheckedChange={() => undefined}
      />,
    )

    const checkbox = screen.getByRole('checkbox', { name: 'Equipped: Battleaxe' })
    expect(checkbox).toHaveAttribute('data-state', 'checked')
    expect(checkbox).toHaveClass('ui-focus-ring--embedded')
  })

  it('shows the equip tooltip with an arrow when unchecked', async () => {
    const user = userEvent.setup()
    render(
      <MonsterEquipmentEquippedToggle
        displayName="Dagger"
        checked={false}
        onCheckedChange={() => undefined}
      />,
    )

    await user.hover(screen.getByRole('checkbox', { name: 'Equipped: Dagger' }))
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent('Equip')
    expect(document.body.querySelector('.ui-popover-content--with-arrow')).not.toBeNull()
    expect(document.body.querySelector('.ui-overlay-arrow')).not.toBeNull()
  })

  it('calls onCheckedChange when toggled', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(
      <MonsterEquipmentEquippedToggle
        displayName="Dagger"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    )

    await user.click(screen.getByRole('checkbox', { name: 'Equipped: Dagger' }))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })
})
