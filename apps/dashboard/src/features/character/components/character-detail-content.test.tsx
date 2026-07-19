import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../lib/character-builder-fixtures'
import { buildCharacterDetailViewModel } from '../lib/character-display'
import { SAMPLE_PC } from '../lib/character-fixtures'
import { CharacterDetailContent } from './character-detail-content.client'

vi.mock('@/components/layout/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))

const mutate = vi.fn()
vi.mock('../hooks/use-delete-character', () => ({
  useDeleteCharacter: () => ({
    mutate,
    isPending: false,
  }),
}))

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)
const viewModel = buildCharacterDetailViewModel({
  character: SAMPLE_PC,
  catalogIndex,
  rules: context.characterCreationRules,
  xpProgression: { entries: [{ level: 1, xpRequired: 0 }] },
})

describe('CharacterDetailContent', () => {
  it('renders the character summary from the view model', () => {
    render(
      <MemoryRouter>
        <CharacterDetailContent viewModel={viewModel} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Verna' })).toBeInTheDocument()
    expect(screen.getByText('Dwarf · Level 1 Fighter')).toBeInTheDocument()
    expect(screen.getByText('0 XP')).toBeInTheDocument()
    expect(screen.getByText('Current')).toBeInTheDocument()
    expect(screen.getByText('Max')).toBeInTheDocument()
  })

  it('renders tab panels for spells, equipment, features, and narrative', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <CharacterDetailContent viewModel={viewModel} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('tab', { name: 'Spells' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Equipment' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Features & Traits' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Narrative' })).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Equipment' }))
    expect(screen.getByText('Wealth: 0 gp')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Narrative' }))
    expect(screen.getByText('A hardy dwarf fighter from the northern holds.')).toBeInTheDocument()
  })

  it('opens the delete confirmation dialog', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <CharacterDetailContent viewModel={viewModel} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Delete character?')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <CharacterDetailContent viewModel={viewModel} />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
