/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { InPageSectionNav } from '../in-page-section-nav'

const sections = [
  { id: 'description-heading', label: 'Description' },
  {
    id: 'features-heading',
    label: 'Features',
    leaves: [{ id: 'feature-level-1', label: 'Level 1' }],
  },
] as const

describe('InPageSectionNav', () => {
  it('insets the desktop rail and keeps the mobile select outside the card', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <InPageSectionNav
        sections={sections}
        eyebrowLabel="On this page"
        navLabel="On this page sections"
        mobileSelectLabel="Section"
        activeSectionId="features-heading"
        activeLeafId="feature-level-1"
      />,
    )

    const card = container.querySelector('.ui-card')
    expect(card).toHaveClass('text-foreground')
    const content = card?.querySelector('.ui-card__content')
    expect(content).toHaveTextContent('On this page')
    expect(content).toHaveTextContent('Features')
    expect(content).toHaveTextContent('Level 1')

    const select = screen.getByRole('combobox', { name: 'Section' })
    expect(card?.contains(select)).toBe(false)

    await user.click(screen.getByRole('link', { name: 'Description' }))
    expect(screen.getByRole('link', { name: 'Description' })).toHaveAttribute(
      'href',
      '#description-heading',
    )
  })
})
