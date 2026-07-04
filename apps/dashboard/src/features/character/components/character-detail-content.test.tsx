import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { SAMPLE_PC } from '../lib/character-fixtures'
import { CharacterDetailContent } from './character-detail-content.client'

vi.mock('@/components/layout/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))

describe('CharacterDetailContent', () => {
  it('renders the character summary', () => {
    render(
      <MemoryRouter>
        <CharacterDetailContent character={SAMPLE_PC} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Verna' })).toBeInTheDocument()
    expect(screen.getByText(/Level 1/)).toBeInTheDocument()
    expect(screen.getByText('Max HP')).toBeInTheDocument()
    expect(screen.getByText('11')).toBeInTheDocument()
    expect(screen.getByText('A hardy dwarf fighter from the northern holds.')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <CharacterDetailContent character={SAMPLE_PC} />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
