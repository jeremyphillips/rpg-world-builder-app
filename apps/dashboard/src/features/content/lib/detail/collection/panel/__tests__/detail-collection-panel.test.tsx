import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { DetailCollectionPanel } from '../detail-collection-panel.client'

describe('DetailCollectionPanel', () => {
  it('renders semantic section with heading, helper, and panel action', () => {
    const { container } = render(
      <DetailCollectionPanel
        heading="Territorial Authority"
        headingId="territorial-authority-heading"
        helper="Organizations that govern, control, or claim this location."
        action={<button type="button">Add</button>}
      >
        <p>Body content</p>
      </DetailCollectionPanel>,
    )

    const section = container.querySelector('section')
    expect(section).toHaveAttribute('aria-labelledby', 'territorial-authority-heading')
    expect(
      screen.getByRole('heading', { name: 'Territorial Authority', level: 2 }),
    ).toHaveAttribute('id', 'territorial-authority-heading')
    expect(
      screen.getByText('Organizations that govern, control, or claim this location.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    expect(screen.getByText('Body content')).toBeInTheDocument()

    expect(section).toHaveClass('rounded-md', 'border', 'border-border-subtle', 'overflow-hidden')

    const header = section?.firstElementChild
    expect(header).toHaveClass('border-b', 'border-border-subtle', 'bg-card', 'px-4', 'py-2')

    const body = header?.nextElementSibling
    expect(body).toHaveClass('bg-surface-subtle')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <DetailCollectionPanel
        heading="Territorial Authority"
        headingId="territorial-authority-heading"
        helper="Organizations that govern, control, or claim this location."
      >
        <p>Body content</p>
      </DetailCollectionPanel>,
    )

    await expectNoAxeViolations(container)
  })
})
