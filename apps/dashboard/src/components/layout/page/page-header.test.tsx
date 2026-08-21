import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { PageHeader } from './page-header'

describe('PageHeader', () => {
  it('renders the page heading', () => {
    render(<PageHeader heading="Equipment" />)
    expect(screen.getByRole('heading', { name: 'Equipment' })).toBeInTheDocument()
  })

  it('renders optional actions', () => {
    render(<PageHeader heading="Species" actions={<button type="button">New</button>} />)
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<PageHeader heading="Campaign Settings" />)
    await expectNoAxeViolations(container)
  })
})
