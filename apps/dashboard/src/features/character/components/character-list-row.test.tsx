import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { EntityRowList } from '@/features/content'

import { CHARACTER_CONTROLLER_DISPLAY } from '../lib/display/character-display-labels'
import { CharacterListRow } from './character-list-row'

function EntityRowListWrapper({ children }: { children: ReactNode }) {
  return (
    <EntityRowList.Root itemCount={1}>
      <EntityRowList.Group itemCount={1}>{children}</EntityRowList.Group>
    </EntityRowList.Root>
  )
}

describe('CharacterListRow', () => {
  it('renders a linked character name and controller copy in the description', () => {
    render(
      <MemoryRouter>
        <EntityRowListWrapper>
          <CharacterListRow
            card={{
              id: 'char_1',
              name: 'Verna',
              summary: 'Dwarf · Level 1 Fighter',
            }}
            detailHref="/campaigns/camp_1/characters/char_1"
            controllerLine={CHARACTER_CONTROLLER_DISPLAY.playedBy('Player One')}
            rosterStatus="active"
          />
        </EntityRowListWrapper>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Verna' })).toHaveAttribute(
      'href',
      '/campaigns/camp_1/characters/char_1',
    )
    expect(screen.getByText(/Dwarf · Level 1 Fighter/)).toBeInTheDocument()
    expect(screen.getByText(/Played by Player One/)).toBeInTheDocument()
  })
})
