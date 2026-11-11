import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Spell } from '@rpg/contracts'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { MonsterSpellPickerDrawer } from './monster-spell-picker-drawer'

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

const fireball = {
  id: 'fireball',
  name: 'Fireball',
  level: 3,
  school: 'evocation',
  castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
  range: { kind: 'distance', value: { value: 150, unit: 'ft' } },
  duration: { kind: 'instantaneous' },
} as Spell

describe('MonsterSpellPickerDrawer', () => {
  it('does not commit a spell when the drawer is cancelled', async () => {
    const user = userEvent.setup()
    const onCommit = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <MonsterSpellPickerDrawer
        open
        mode="add"
        spells={[fireball]}
        disabledSpellIds={new Set()}
        onOpenChange={onOpenChange}
        onCommit={onCommit}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCommit).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('commits the selected spell id', async () => {
    const user = userEvent.setup()
    const onCommit = vi.fn()
    render(
      <MonsterSpellPickerDrawer
        open
        mode="add"
        spells={[fireball]}
        disabledSpellIds={new Set()}
        onOpenChange={() => undefined}
        onCommit={onCommit}
      />,
    )
    await user.click(screen.getByRole('radio', { name: 'Fireball' }))
    await user.click(screen.getByRole('button', { name: 'Add spell' }))
    expect(onCommit).toHaveBeenCalledWith('fireball')
  })
})
