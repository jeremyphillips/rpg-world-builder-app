import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { DrawerEntityBlock } from './drawer-entity-block.client'

describe('DrawerEntityBlock', () => {
  it('projects heading, classification, and description through EntityAnatomy', () => {
    render(
      <DrawerEntityBlock
        heading="Dock Ward"
        headingSuffix=" · District"
        supportingText="Located in Harborford"
      />,
    )

    expect(screen.getByText('Dock Ward')).toBeInTheDocument()
    expect(screen.getByText('District')).toBeInTheDocument()
    expect(screen.getByText('Located in Harborford')).toBeInTheDocument()
  })

  it('passes href through as heading navigation', () => {
    render(
      <MemoryRouter>
        <DrawerEntityBlock heading="Silver Circle" href="/campaigns/camp-1/organizations/org-1" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Silver Circle' })).toHaveAttribute(
      'href',
      '/campaigns/camp-1/organizations/org-1',
    )
  })
})
