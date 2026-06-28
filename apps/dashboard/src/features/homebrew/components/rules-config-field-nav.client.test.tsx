import { describe, expect, it, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { RulesConfigFieldNav } from './rules-config-field-nav.client'

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => undefined
    HTMLElement.prototype.releasePointerCapture = () => undefined
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = vi.fn()
  }
})

describe('RulesConfigFieldNav', () => {
  it('lists character configuration sections in the desktop rail', () => {
    render(
      <MemoryRouter>
        <RulesConfigFieldNav />
      </MemoryRouter>,
    )

    const rail = screen.getByRole('navigation', { name: 'Character configuration sections' })
    expect(rail).toHaveTextContent('Starting level')
    expect(rail).toHaveTextContent('Imported characters')
    expect(rail).toHaveTextContent('Extended progression')
  })

  it('scrolls to a section from the mobile select', async () => {
    const scrollIntoView = vi.fn()
    HTMLElement.prototype.scrollIntoView = scrollIntoView

    const target = document.createElement('div')
    target.id = 'creature-type-policy'
    document.body.appendChild(target)

    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <RulesConfigFieldNav />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('combobox', { name: 'Character configuration section' }))
    await user.click(await screen.findByRole('option', { name: 'Creature types' }))

    expect(scrollIntoView).toHaveBeenCalled()
    target.remove()
  })
})
