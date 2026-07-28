import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  buildCharacterCardViewModel,
  CHARACTER_CARD_CAMPAIGN_LABEL,
} from '../lib/character-display'
import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../lib/character-builder-fixtures'
import { SAMPLE_PC } from '../lib/character-fixtures'
import { CharacterListCard } from './character-list-card.client'

const catalogIndex = createStandaloneBuilderCatalogIndexFixture(
  createPopulatedStandaloneBuilderContextFixture(),
)

describe('CharacterListCard', () => {
  it('renders the card summary and view link', () => {
    render(
      <MemoryRouter>
        <CharacterListCard card={buildCharacterCardViewModel(SAMPLE_PC, catalogIndex)} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Verna')).toBeInTheDocument()
    expect(screen.getByText('Dwarf · Level 1 Fighter')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute(
      'href',
      '/characters/char-sample-1',
    )
  })

  it('renders optional campaign metadata and custom detail href', () => {
    render(
      <MemoryRouter>
        <CharacterListCard
          card={{
            ...buildCharacterCardViewModel(SAMPLE_PC, catalogIndex),
            campaign: { id: 'camp_1', name: 'The Argent Road' },
          }}
          detailHref="/campaigns/camp_1/characters/char-sample-1"
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByText(`${CHARACTER_CARD_CAMPAIGN_LABEL}: The Argent Road`),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute(
      'href',
      '/campaigns/camp_1/characters/char-sample-1',
    )
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <CharacterListCard card={buildCharacterCardViewModel(SAMPLE_PC, catalogIndex)} />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
