import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import { PageHeader } from './page-header'

const axeOptions = { rules: { 'color-contrast': { enabled: false } } }

describe('PageHeader', () => {
  it('renders the page heading', () => {
    render(<PageHeader heading="Equipment" />)
    expect(screen.getByRole('heading', { name: 'Equipment' })).toBeInTheDocument()
  })

  it('renders optional actions', () => {
    render(<PageHeader heading="Species" actions={<button type="button">New</button>} />)
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<PageHeader heading="Campaign Settings" />)
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })
})
