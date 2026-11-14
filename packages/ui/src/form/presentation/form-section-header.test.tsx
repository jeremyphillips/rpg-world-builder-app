import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  fieldAnatomyStackVariants,
  fieldSetInFlowLegendClasses,
} from '../../components/ui/field.variants'
import { FormSectionHeader } from './form-section-header.client'

describe('FormSectionHeader', () => {
  it('renders hint below the label when an action is present', () => {
    render(
      <FormSectionHeader
        label="Tables"
        hint="Tables provide level-based values referenced by this feature."
        headingScale="subsection"
        action={<button type="button">Add table</button>}
      />,
    )

    expect(screen.getByText('Tables')).toBeInTheDocument()
    expect(
      screen.getByText('Tables provide level-based values referenced by this feature.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add table' })).toBeInTheDocument()
    expect(document.querySelector('.grid')).toHaveClass('items-start')
  })

  it('centers the action with a single-line heading when no hint is present', () => {
    render(
      <FormSectionHeader
        label="Equipment"
        headingScale="subsection"
        labelAccessory={<span data-testid="count">2</span>}
        action={<button type="button">Add equipment</button>}
      />,
    )

    expect(document.querySelector('.grid')).toHaveClass('items-center')
    expect(screen.getByTestId('count')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add equipment' })).toBeInTheDocument()
  })

  it('applies field-scale typography when headingScale is field', () => {
    render(
      <FormSectionHeader
        label="Columns"
        hint="Add the columns for this table."
        headingScale="field"
        size="md"
        required
      />,
    )

    const label = screen.getByText('Columns')
    expect(label.parentElement).toHaveClass('text-style-field-label-md')
    expect(screen.getByText('Add the columns for this table.')).toHaveClass('text-style-field-hint')
  })

  it('composes an in-flow legend for field-scale array headers', () => {
    const { container } = render(
      <fieldset className={fieldAnatomyStackVariants({ size: 'md' })}>
        <legend className={fieldSetInFlowLegendClasses}>
          <FormSectionHeader
            label="Grants"
            hint="Add the mechanical effects this feature provides."
            headingScale="field"
            size="md"
            action={<button type="button">Add grant</button>}
          />
        </legend>
      </fieldset>,
    )

    const legend = container.querySelector('legend')
    expect(legend).toHaveClass(...fieldSetInFlowLegendClasses.split(/\s+/))
    expect(legend).not.toHaveClass('text-style-field-label-md')
    expect(screen.getByText('Grants').parentElement).toHaveClass('text-style-field-label-md')
    expect(screen.getByText('Add the mechanical effects this feature provides.')).toHaveClass(
      'text-style-field-hint',
    )
    expect(screen.getByRole('button', { name: 'Add grant' })).toBeInTheDocument()
  })
})
