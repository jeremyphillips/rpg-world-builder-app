import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import { SelectField } from './select-field'

const options = [
  { label: 'Lawful Good', value: 'lawful-good' },
  { label: 'True Neutral', value: 'true-neutral' },
]

describe('SelectField', () => {
  it('labels the trigger and shows the placeholder', () => {
    render(<SelectField id="alignment" label="Alignment" placeholder="Choose…" options={options} />)
    const trigger = screen.getByLabelText('Alignment')
    expect(trigger).toHaveTextContent('Choose…')
  })

  it('renders the error and marks the trigger invalid, hiding the hint', () => {
    render(
      <SelectField
        id="alignment"
        label="Alignment"
        hint="Pick one."
        error="Required."
        options={options}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Required.')
    expect(screen.queryByText('Pick one.')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Alignment')).toHaveAttribute('aria-invalid', 'true')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <SelectField id="alignment" label="Alignment" placeholder="Choose…" options={options} />,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
