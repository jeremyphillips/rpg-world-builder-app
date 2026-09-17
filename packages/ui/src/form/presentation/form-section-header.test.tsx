import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FormSectionHeader } from './form-section-header.client'
describe('FormSectionHeader', () => {
  it('renders hint below the label when an action is present', () => {
    render(
      <FormSectionHeader
        label="Tables"
        hint="Tables provide level-based values referenced by this feature."
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

  it('applies comfortable field-label typography when labelPresentation is field-label', () => {
    render(
      <FormSectionHeader
        label="Columns"
        hint="Add the columns for this table."
        labelPresentation="field-label"
        size="md"
        required
      />,
    )

    const label = screen.getByText('Columns')
    expect(label.parentElement).toHaveClass('text-md')
    expect(label.parentElement).toHaveClass('font-field-label')
    expect(screen.getByText('Add the columns for this table.')).toHaveClass('font-normal')
  })
})
