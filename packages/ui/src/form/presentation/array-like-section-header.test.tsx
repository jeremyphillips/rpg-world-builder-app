import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  fieldAnatomyStackVariants,
  fieldSetInFlowLegendClasses,
} from '../../components/ui/field.variants'
import { ArrayLikeSectionHeader } from './array-like-section-header.client'

describe('ArrayLikeSectionHeader', () => {
  it('renders an in-flow legend with label typography on the label line only', () => {
    const { container } = render(
      <fieldset className={fieldAnatomyStackVariants({ size: 'md' })}>
        <ArrayLikeSectionHeader
          label="Grants"
          hint="Add the mechanical effects this feature provides."
          size="md"
          action={<button type="button">Add grant</button>}
        />
      </fieldset>,
    )

    const legend = container.querySelector('legend')
    expect(legend).toHaveClass(...fieldSetInFlowLegendClasses.split(/\s+/))
    expect(legend).not.toHaveClass('mb-1.5')
    expect(legend).not.toHaveClass('text-style-field-label-md')
    expect(screen.getByText('Grants').parentElement).toHaveClass('text-style-field-label-md')
    expect(screen.getByText('Add the mechanical effects this feature provides.')).toHaveClass(
      'text-style-caption',
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
    expect(screen.getByText('Tables').parentElement).toHaveClass('text-style-field-label-md')
  })
})
