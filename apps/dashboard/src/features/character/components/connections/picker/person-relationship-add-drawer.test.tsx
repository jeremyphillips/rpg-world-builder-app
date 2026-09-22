import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { CharacterPickerOption } from '../../../lib/picker/character-picker-option.lib'
import { PersonRelationshipAddDrawer } from './person-relationship-add-drawer'

const characters: CharacterPickerOption[] = [
  {
    id: 'char-1',
    name: 'Darius Vale',
    summary: 'Human fighter',
    characterType: 'npc',
    classIds: ['fighter'],
  },
]

vi.mock('./character-picker-drawer', () => ({
  CharacterPickerDrawer: ({
    open,
    onSelect,
  }: {
    open: boolean
    onSelect: (characterId: string) => void
  }) =>
    open ? (
      <button type="button" onClick={() => onSelect('char-1')}>
        Pick Darius Vale
      </button>
    ) : null,
}))

describe('PersonRelationshipAddDrawer', () => {
  it('advances to the role step after selecting a character instead of closing', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <PersonRelationshipAddDrawer
        open
        onOpenChange={onOpenChange}
        characters={characters}
        onAdd={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Pick Darius Vale' }))

    expect(screen.getByText('How is Darius Vale connected to this character?')).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })
})
