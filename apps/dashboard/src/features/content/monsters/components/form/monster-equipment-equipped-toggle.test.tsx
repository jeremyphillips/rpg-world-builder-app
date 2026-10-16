import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { MonsterEquipmentEquippedToggle } from './monster-equipment-equipped-toggle'

describe('MonsterEquipmentEquippedToggle', () => {
  it('keeps checked state and embedded focus on the expanding checkbox', () => {
    render(
      <MonsterEquipmentEquippedToggle
        displayName="Battleaxe"
        checked
        onCheckedChange={() => undefined}
      />,
    )

    const checkbox = screen.getByRole('checkbox', { name: 'Equipped: Battleaxe' })
    expect(checkbox).toHaveAttribute('data-state', 'checked')
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
    expect(checkbox).toHaveClass('ui-focus-ring--embedded', 'ui-choice-control--circle-expand')
    expect(checkbox.querySelector('.ui-choice-control__expand-label')).toHaveTextContent('Unequip')
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('reveals Equip when unchecked and does not render a tooltip', () => {
    render(
      <MonsterEquipmentEquippedToggle
        displayName="Dagger"
        checked={false}
        onCheckedChange={() => undefined}
      />,
    )

    const checkbox = screen.getByRole('checkbox', { name: 'Equipped: Dagger' })
    expect(checkbox.querySelector('.ui-choice-control__expand-label')).toHaveTextContent('Equip')
    expect(screen.queryByRole('tooltip')).toBeNull()
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

  it('does not expand a disabled control into an actionable label', () => {
    render(
      <MonsterEquipmentEquippedToggle
        displayName="Dagger"
        checked
        disabled
        onCheckedChange={() => undefined}
      />,
    )

    const checkbox = screen.getByRole('checkbox', { name: 'Equipped: Dagger' })
    expect(checkbox).toBeDisabled()
    expect(checkbox.querySelector('.ui-choice-control__expand-label')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })
})
