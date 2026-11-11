import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Spell } from '@rpg/contracts'
import { ArrayFieldContext, type ArrayFieldContextValue } from '@rpg/ui/form'
import { describe, expect, it, vi } from 'vitest'

import { MonsterSpellChangeAction } from './monster-spell-entry-card'
import { MonsterSpellPickerContext } from './monster-spell-picker-context'

const catalog = new Map<string, Spell>([
  [
    'fireball',
    {
      id: 'fireball',
      name: 'Fireball',
    } as Spell,
  ],
])

const arrayContext: ArrayFieldContextValue = {
  items: [{ spellId: 'fireball' }],
  rowIndex: 0,
  watchedValues: {},
}

describe('MonsterSpellChangeAction', () => {
  it('is an icon-only replace control named with the spell', async () => {
    const user = userEvent.setup()
    const openChange = vi.fn()
    const { container } = render(
      <MonsterSpellPickerContext.Provider value={{ openChange }}>
        <ArrayFieldContext.Provider value={arrayContext}>
          <MonsterSpellChangeAction catalog={catalog} />
        </ArrayFieldContext.Provider>
      </MonsterSpellPickerContext.Provider>,
    )

    const button = screen.getByRole('button', { name: 'Change spell Fireball' })
    expect(button).toHaveAttribute('type', 'button')
    const icon = container.querySelector('svg')
    expect(icon).toHaveAttribute('data-icon', 'arrow-left-right')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    await user.click(button)
    expect(openChange).toHaveBeenCalledWith(0)
  })
})
