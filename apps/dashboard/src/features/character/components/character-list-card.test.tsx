import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { CHARACTER_CONTROLLER_DISPLAY } from '../lib/display/character-display-labels'
import { CharacterListCard } from './character-list-card'

const sampleCard = {
  id: 'char-1',
  name: 'Verna',
  summary: 'Dwarf · Level 1 Fighter',
} as const

describe('CharacterListCard', () => {
  it('renders the card summary and view link', () => {
    render(
      <MemoryRouter>
        <CharacterListCard card={sampleCard} detailHref="/characters/char-1" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Verna', level: 3 })).toHaveClass(
      'ui-identity-row__title',
    )
    expect(
      screen.getByRole('heading', { name: 'Verna', level: 3 }).closest('.ui-card--comfortable'),
    ).not.toBeNull()
    expect(screen.getByText('Dwarf · Level 1 Fighter')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute('href', '/characters/char-1')
  })

  it('renders optional campaign metadata', () => {
    render(
      <MemoryRouter>
        <CharacterListCard
          card={{
            ...sampleCard,
            campaign: { id: 'camp-1', name: 'The Argent Road' },
          }}
          detailHref="/campaigns/camp-1/characters/char-1"
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('The Argent Road')).toBeInTheDocument()
  })

  it('renders optional roster status badge', () => {
    render(
      <MemoryRouter>
        <CharacterListCard
          card={sampleCard}
          detailHref="/characters/char-1"
          rosterStatus="inactive"
        />
      </MemoryRouter>,
    )

    const heading = screen.getByRole('heading', { name: 'Verna', level: 3 })
    expect(screen.getByText('Inactive')).toBeInTheDocument()
    expect(heading).not.toContainElement(screen.getByText('Inactive'))
  })

  it('hides campaign metadata when showCampaign is false', () => {
    render(
      <MemoryRouter>
        <CharacterListCard
          card={{
            ...sampleCard,
            campaign: { id: 'camp-1', name: 'The Argent Road' },
          }}
          detailHref="/campaigns/camp-1/characters/char-1"
          showCampaign={false}
        />
      </MemoryRouter>,
    )

    expect(screen.queryByText('The Argent Road')).not.toBeInTheDocument()
  })

  it('renders controller line inside the card header', () => {
    render(
      <MemoryRouter>
        <CharacterListCard
          card={sampleCard}
          detailHref="/characters/char-1"
          controllerLine={CHARACTER_CONTROLLER_DISPLAY.playedByYou}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText(CHARACTER_CONTROLLER_DISPLAY.playedByYou)).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <CharacterListCard
          card={sampleCard}
          detailHref="/characters/char-1"
          controllerLine={CHARACTER_CONTROLLER_DISPLAY.noPlayerAssigned}
          showCampaign={false}
        />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })

  it('keeps card region insets around a full-bleed portrait', () => {
    const { container } = render(
      <MemoryRouter>
        <CharacterListCard
          card={{
            ...sampleCard,
            name: 'Very Long Character Name That Should Truncate Beside The Badge',
            displayImagesByRole: {
              primary: {
                src: '/hero.png',
                role: 'primary',
                sourceKind: 'upload',
                crop: { x: 0.1, y: 0.2, width: 0.5, height: 0.5 },
              },
            },
          }}
          detailHref="/characters/char-1"
          rosterStatus="inactive"
        />
      </MemoryRouter>,
    )

    const header = container.querySelector('.ui-card__header')
    const footer = container.querySelector('.ui-card__footer')
    expect(header).toBeTruthy()
    expect(header?.className).not.toContain('px-5')
    expect(footer).toHaveClass('mt-auto')
    expect(footer?.className).not.toContain('px-5')
    expect(container.querySelector('img')).toBeTruthy()
    expect(
      screen.getByRole('heading', {
        name: 'Very Long Character Name That Should Truncate Beside The Badge',
      }),
    ).toHaveClass('truncate')
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute('href', '/characters/char-1')
  })
})
