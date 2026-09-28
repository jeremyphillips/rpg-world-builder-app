import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { RelationshipList } from '@/features/content'

import { CHARACTER_CONTROLLER_DISPLAY } from '../lib/display/character-display-labels'
import { CharacterListRow } from './character-list-row'

function RelationshipListWrapper({ children }: { children: ReactNode }) {
  return (
    <RelationshipList.Root itemCount={1}>
      <RelationshipList.Group itemCount={1}>{children}</RelationshipList.Group>
    </RelationshipList.Root>
  )
}

describe('CharacterListRow', () => {
  it('renders a linked character name and controller copy in the description', () => {
    render(
      <MemoryRouter>
        <RelationshipListWrapper>
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
        </RelationshipListWrapper>
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
