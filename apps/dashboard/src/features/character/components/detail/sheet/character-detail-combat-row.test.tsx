import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  CHARACTER_EMPTY_SECTION_TEXT,
  CHARACTER_SECTION_LABELS,
} from '../../../lib/display/character-display'
import { CharacterDetailCombatRow } from './character-detail-combat-row'

const savingThrows = {
  title: CHARACTER_SECTION_LABELS.savingThrows,
  items: [{ id: 'dex', label: 'Dexterity', detail: '+2' }],
  emptyText: CHARACTER_EMPTY_SECTION_TEXT.savingThrows,
}

const emptyProficiencies = {
  title: CHARACTER_SECTION_LABELS.proficiencies,
  groups: [],
  emptyText: CHARACTER_EMPTY_SECTION_TEXT.proficiencies,
}

describe('CharacterDetailCombatRow', () => {
  it('insets an empty actions ledger', () => {
    render(
      <CharacterDetailCombatRow
        actions={[]}
        savingThrows={savingThrows}
        proficiencies={emptyProficiencies}
      />,
    )

    const empty = screen.getByText(CHARACTER_EMPTY_SECTION_TEXT.actions)
    expect(empty.closest('.ui-panel')).toHaveClass('ui-panel--subtle', 'ui-panel--compact')
    expect(empty.closest('.ui-panel')).not.toHaveClass('space-y-3', 'ui-card')
    expect(screen.getByText('Dexterity').closest('.ui-panel')).toHaveClass('ui-panel--subtle')
    expect(
      screen.getByText(CHARACTER_EMPTY_SECTION_TEXT.proficiencies).closest('.ui-panel'),
    ).toHaveClass('ui-panel--subtle')
  })

  it('insets populated actions', () => {
    render(
      <CharacterDetailCombatRow
        actions={[{ id: 'longsword', name: 'Longsword', attackBonus: '+5', damage: '1d8+3' }]}
        savingThrows={savingThrows}
        proficiencies={emptyProficiencies}
      />,
    )

    expect(screen.getByText('Longsword').closest('.ui-panel')).toHaveClass('ui-panel--subtle')
    expect(screen.getByText('Attack +5')).toBeInTheDocument()
  })
})
