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
    expect(rail.parentElement).toHaveClass('lg:self-stretch')
    expect(rail.parentElement).not.toHaveClass('lg:sticky')
    expect(rail).toHaveClass(
      'lg:sticky',
      'lg:top-[var(--app-sticky-chrome-block-size,calc(3rem+2.5rem))]',
      'lg:self-start',
    )
    expect(rail).toHaveClass('bg-surface-faint', 'rounded-lg')
    expect(rail).toHaveTextContent('Creation')
    expect(rail).toHaveTextContent('Starting level')
    expect(rail).toHaveTextContent('Progression')
    expect(rail).toHaveTextContent('Extended progression')
  })

  it('marks the active section without a leaf using bold foreground text', () => {
    render(<RulesConfigFieldNav {...defaultNavProps} activeSectionId="progression" />)

    const activeSection = screen.getByRole('link', { name: 'Progression' })
    expect(activeSection).toHaveAttribute('aria-current', 'location')
    expect(activeSection).toHaveClass('font-bold', 'text-foreground')
    expect(activeSection).not.toHaveClass('bg-accent')
    expect(screen.getByRole('link', { name: 'Standard max level' })).not.toHaveAttribute(
      'aria-current',
    )

    const leafList = activeSection.closest('li')?.querySelector('ul')
    expect(leafList).toHaveClass('border-neutral-contrast')
  })

  it('marks the active leaf and keeps its parent section bold but muted in the active group', () => {
    render(
      <RulesConfigFieldNav
        {...defaultNavProps}
        activeSectionId="creation"
        activeLeafId="creation-standard-array"
      />,
    )

    const parentSection = screen.getByRole('link', { name: 'Creation' })
    expect(parentSection).not.toHaveAttribute('aria-current')
    expect(parentSection).toHaveClass('font-bold', 'text-muted-foreground')
    expect(parentSection).not.toHaveClass('text-foreground', 'bg-accent')

    const activeLeaf = screen.getByRole('link', { name: 'Standard array' })
    expect(activeLeaf).toHaveAttribute('aria-current', 'true')
    expect(activeLeaf).toHaveClass('font-bold', 'text-foreground')

    const leafList = parentSection.closest('li')?.querySelector('ul')
    expect(leafList).toHaveClass('border-l-2', 'border-neutral-contrast')
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
