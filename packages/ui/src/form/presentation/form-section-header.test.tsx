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
})
