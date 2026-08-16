import { describe, expect, it, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CHARACTER_CONFIGURATION_SECTIONS } from '@/features/campaign'

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

const defaultNavProps = {
  sections: CHARACTER_CONFIGURATION_SECTIONS,
  navLabel: 'Character configuration sections',
  mobileSelectLabel: 'Character configuration section',
}

describe('RulesConfigFieldNav', () => {
  it('lists provided sections in the desktop rail', () => {
    render(<RulesConfigFieldNav {...defaultNavProps} />)

    const rail = screen.getByRole('navigation', { name: 'Character configuration sections' })
    expect(rail).toHaveTextContent('Creation')
    expect(rail).toHaveTextContent('Progression')
  })

  it('scrolls to a section from the mobile select', async () => {
    const scrollIntoView = vi.fn()
    HTMLElement.prototype.scrollIntoView = scrollIntoView

    const target = document.createElement('div')
    target.id = 'multiclassing'
    document.body.appendChild(target)

    const user = userEvent.setup()
    render(<RulesConfigFieldNav {...defaultNavProps} />)

    await user.click(screen.getByRole('combobox', { name: 'Character configuration section' }))
    await user.click(await screen.findByRole('option', { name: 'Multiclassing' }))

    expect(scrollIntoView).toHaveBeenCalled()
    target.remove()
  })
})
