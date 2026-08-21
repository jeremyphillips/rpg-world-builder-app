import { describe, expect, it, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { buildCharacterConfigurationNavigation } from '@/features/campaign'

import { RulesConfigFieldNav } from './rules-config-field-nav'

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

const sections = buildCharacterConfigurationNavigation()

const defaultNavProps = {
  sections,
  navLabel: 'Character configuration sections',
  mobileSelectLabel: 'Character configuration section',
}

describe('RulesConfigFieldNav', () => {
  it('lists section and leaf links in the desktop rail', () => {
    render(<RulesConfigFieldNav {...defaultNavProps} />)

    const rail = screen.getByRole('navigation', { name: 'Character configuration sections' })
    expect(rail).toHaveTextContent('Creation')
    expect(rail).toHaveTextContent('Starting level')
    expect(rail).toHaveTextContent('Progression')
    expect(rail).toHaveTextContent('Extended progression')
  })

  it('marks the active section without a leaf', () => {
    render(<RulesConfigFieldNav {...defaultNavProps} activeSectionId="progression" />)

    expect(screen.getByRole('link', { name: 'Progression' })).toHaveAttribute(
      'aria-current',
      'location',
    )
    expect(screen.getByRole('link', { name: 'Standard max level' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('marks the active leaf and keeps its parent section unhighlighted', () => {
    render(
      <RulesConfigFieldNav
        {...defaultNavProps}
        activeSectionId="creation"
        activeLeafId="creation-standard-array"
      />,
    )

    expect(screen.getByRole('link', { name: 'Creation' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Standard array' })).toHaveAttribute(
      'aria-current',
      'true',
    )
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

  it('includes prefixed leaf labels in the mobile select', async () => {
    const user = userEvent.setup()
    render(<RulesConfigFieldNav {...defaultNavProps} />)

    await user.click(screen.getByRole('combobox', { name: 'Character configuration section' }))

    expect(
      await screen.findByRole('option', { name: 'Creation · Starting level' }),
    ).toBeInTheDocument()
  })

  it('scrolls to a leaf target when selected on mobile', async () => {
    const scrollIntoView = vi.fn()
    HTMLElement.prototype.scrollIntoView = scrollIntoView

    const target = document.createElement('div')
    target.id = 'creation-standard-array'
    document.body.appendChild(target)

    const user = userEvent.setup()
    render(<RulesConfigFieldNav {...defaultNavProps} />)

    await user.click(screen.getByRole('combobox', { name: 'Character configuration section' }))
    await user.click(await screen.findByRole('option', { name: 'Creation · Standard array' }))

    expect(scrollIntoView).toHaveBeenCalled()
    target.remove()
  })
})
