import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import { ContentDetailStatBody } from './content-detail-stat-body'

const axeOptions = { rules: { 'color-contrast': { enabled: false } } }

describe('ContentDetailStatBody', () => {
  it('renders the name, stat rows, and plain-text description', () => {
    render(
      <ContentDetailStatBody
        name="Longsword"
        statRows={[
          { label: 'Category', value: 'Martial' },
          { label: 'Cost', value: '15 gp' },
        ]}
        description="A martial weapon."
      />,
    )

    expect(screen.getByRole('heading', { level: 2, name: 'Longsword' })).toBeInTheDocument()
    expect(screen.getByText(/Category:/)).toHaveTextContent('Martial')
    expect(screen.getByText(/Cost:/)).toHaveTextContent('15 gp')
    expect(screen.getByText('A martial weapon.')).toBeInTheDocument()
  })

  it('omits description when none is provided', () => {
    render(<ContentDetailStatBody name="Shield" statRows={[{ label: 'AC', value: '+2' }]} />)

    expect(screen.queryByText('A martial weapon.')).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <ContentDetailStatBody
        name="Chain Mail"
        statRows={[
          { label: 'Category', value: 'Heavy' },
          { label: 'AC', value: '16' },
        ]}
        description="Heavy armor made of interlocking metal rings."
      />,
    )

    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })
})
