import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { buildCharacterCardViewModel } from '../lib/character-display'
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

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <CharacterListCard card={buildCharacterCardViewModel(SAMPLE_PC, catalogIndex)} />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
