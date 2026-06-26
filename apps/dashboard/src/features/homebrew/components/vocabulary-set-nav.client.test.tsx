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
  it('lists every vocabulary set in the desktop rail', () => {
    render(
      <MemoryRouter>
        <VocabularySetNav campaignId="camp_1" activeSetId="creature-types" />
      </MemoryRouter>,
    )

    const rail = screen.getByRole('navigation', { name: 'Rules vocabulary sets' })
    expect(rail).toHaveTextContent('Creature Types')
    expect(rail).toHaveTextContent('Damage Types')
    expect(rail).toHaveTextContent('Equipment Categories')
  })

  it('shows the active set in the mobile select and lists disabled sets in the menu', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[ROUTES.homebrew.vocabulary('camp_1', 'creature-types')]}>
        <VocabularySetNav campaignId="camp_1" activeSetId="creature-types" />
      </MemoryRouter>,
    )

    const select = screen.getByRole('combobox', { name: 'Rules vocabulary set' })
    expect(select).toHaveTextContent('Creature Types')

    await user.click(select)
    expect(await screen.findByRole('option', { name: 'Damage Types' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })
})
