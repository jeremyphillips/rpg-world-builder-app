import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { ROUTES } from '@/app/routes'

import { VocabularySetNav } from './vocabulary-set-nav.client'

const navigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    useNavigate: () => navigate,
  }
})

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => undefined
    HTMLElement.prototype.releasePointerCapture = () => undefined
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => undefined
  }
})

describe('VocabularySetNav', () => {
  it('lists browsable categories in the desktop rail', () => {
    render(
      <MemoryRouter>
        <VocabularySetNav campaignId="camp_1" activeSetId="creature-types" />
      </MemoryRouter>,
    )

    const rail = screen.getByRole('navigation', { name: 'Game Terms categories' })
    expect(rail).toHaveTextContent('Creature Types')
    expect(rail).toHaveTextContent('Damage Types')
    expect(rail).toHaveTextContent('Equipment Categories')
    expect(rail).not.toHaveTextContent('Edition Presets')
  })

  it('shows the active set in the mobile select', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[ROUTES.gameTerms.overview('camp_1', 'creature-types')]}>
        <VocabularySetNav campaignId="camp_1" activeSetId="creature-types" />
      </MemoryRouter>,
    )

    const select = screen.getByRole('combobox', { name: 'Game Terms category' })
    expect(select).toHaveTextContent('Creature Types')

    await user.click(select)
    expect(await screen.findByRole('option', { name: 'Damage Types' })).toBeInTheDocument()
  })
})
