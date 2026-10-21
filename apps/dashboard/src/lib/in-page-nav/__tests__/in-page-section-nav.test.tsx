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
  it('insets the desktop rail and keeps the mobile select outside the panel', async () => {
    const user = userEvent.setup()
    render(
      <InPageSectionNav
        sections={sections}
        eyebrowLabel="On this page"
        navLabel="On this page sections"
        mobileSelectLabel="Section"
        activeSectionId="features-heading"
        activeLeafId="feature-level-1"
      />,
    )

    const rail = screen.getByRole('navigation', { name: 'On this page sections' })
    const panel = rail.firstElementChild
    expect(panel).toHaveClass('rounded-md', 'border', 'text-foreground')
    expect(panel).not.toHaveClass('ui-card')
    expect(panel).toHaveTextContent('On this page')
    expect(panel).toHaveTextContent('Features')
    expect(panel).toHaveTextContent('Level 1')

    const select = screen.getByRole('combobox', { name: 'Section' })
    expect(panel?.contains(select)).toBe(false)

    await user.click(screen.getByRole('link', { name: 'Description' }))
    expect(screen.getByRole('link', { name: 'Description' })).toHaveAttribute(
      'href',
      '#description-heading',
    )
  })
})
