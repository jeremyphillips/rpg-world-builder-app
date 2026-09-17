import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ArrayLikeSectionHeader } from './array-like-section-header.client'

describe('ArrayLikeSectionHeader', () => {
  it('renders a legend wrapper with field-label typography by default', () => {
    const { container } = render(
      <fieldset>
        <ArrayLikeSectionHeader
          label="Grants"
          hint="Add the mechanical effects this feature provides."
          size="md"
          action={<button type="button">Add grant</button>}
        />
      </fieldset>,
    )

    const legend = container.querySelector('legend')
    expect(legend).toHaveClass('font-field-label')
    expect(legend).toHaveClass('text-md')
    expect(screen.getByText('Grants')).toBeInTheDocument()
    expect(screen.getByText('Add the mechanical effects this feature provides.')).toHaveClass(
      'font-normal',
    )
    expect(screen.getByRole('button', { name: 'Add grant' })).toBeInTheDocument()
  })

  it('renders without a legend wrapper when wrapper is none', () => {
    const { container } = render(
      <ArrayLikeSectionHeader
        label="Tables"
        hint="Tables provide level-based values referenced by this feature."
        wrapper="none"
        id="tables-heading"
      />,
    )

    expect(container.querySelector('legend')).toBeNull()
    expect(screen.getByText('Tables').parentElement).toHaveClass('font-field-label')
  })
})
