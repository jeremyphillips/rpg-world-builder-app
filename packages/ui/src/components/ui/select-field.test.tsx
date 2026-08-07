import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { SelectField } from './select-field'

const options = [
  { label: 'Lawful Good', value: 'lg' },
  { label: 'Neutral', value: 'n' },
]

const groupedOptions = [
  {
    kind: 'group' as const,
    label: 'Standard levels',
    options: [
      { label: '1', value: '1' },
      { label: '2', value: '2' },
    ],
  },
  {
    kind: 'group' as const,
    label: 'Epic Destiny Tier',
    options: [{ label: '21', value: '21' }],
  },
]

describe('SelectField', () => {
  it('labels the trigger and shows the placeholder', () => {
    render(<SelectField id="alignment" label="Alignment" placeholder="Choose…" options={options} />)
    const trigger = screen.getByLabelText('Alignment')
    expect(trigger).toHaveTextContent('Choose…')
  })

  it('defaults the placeholder to Select {label}…', () => {
    render(<SelectField id="alignment" label="Alignment" options={options} />)
    expect(screen.getByLabelText('Alignment')).toHaveTextContent('Select Alignment…')
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

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <SelectField id="alignment" label="Alignment" placeholder="Choose…" options={options} />,
    )
    await expectNoAxeViolations(container)
  })

  it('renders grouped options with section labels', () => {
    render(<SelectField id="level" label="Level" placeholder="Choose…" options={groupedOptions} />)
    expect(screen.getByLabelText('Level')).toBeInTheDocument()
  })

  it('applies digit width to the trigger while keeping the field container full width', () => {
    const hint = 'First class level at which this class gains spellcasting'
    const { container } = render(
      <SelectField
        id="level"
        label="Spellcasting level"
        hint={hint}
        digits={2}
        defaultValue="3"
        options={[
          { label: '1', value: '1' },
          { label: '3', value: '3' },
        ]}
      />,
    )

    const trigger = screen.getByLabelText('Spellcasting level')
    expect(trigger).toHaveClass('w-[calc(2*1ch+2.75rem)]')
    expect(container.firstChild).toHaveClass('w-full')
    expect(screen.getByText(hint)).toBeInTheDocument()
  })

  it('renders label and control on one row when labelPosition is inline', () => {
    render(
      <SelectField
        id="level"
        label="Choose level"
        info="Up to level 20."
        labelPosition="inline"
        digits={2}
        defaultValue="3"
        width="auto"
        options={[
          { label: '1', value: '1' },
          { label: '3', value: '3' },
        ]}
      />,
    )

    const trigger = screen.getByRole('combobox', { name: /Choose level/i })
    const row = trigger.closest('.flex')
    expect(row).toHaveClass('items-center')
    expect(screen.getByRole('button', { name: 'About Choose level' })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations with inline layout', async () => {
    const { container } = render(
      <SelectField
        id="level"
        label="Choose level"
        labelPosition="inline"
        digits={2}
        defaultValue="1"
        options={[{ label: '1', value: '1' }]}
      />,
    )
    await expectNoAxeViolations(container)
  })

  it('renders label and hint in the left column when labelPosition is settings', () => {
    const hint = 'First class level at which this class gains spellcasting'
    render(
      <SelectField
        id="level"
        label="Spellcasting level"
        hint={hint}
        labelPosition="settings"
        digits={2}
        defaultValue="3"
        options={[
          { label: '1', value: '1' },
          { label: '3', value: '3' },
        ]}
      />,
    )

    const trigger = screen.getByLabelText('Spellcasting level')
    const row = trigger.closest('.grid')
    expect(row).toHaveClass('sm:grid-cols-[minmax(0,1fr)_auto]')
    const label = screen.getByText('Spellcasting level')
    expect(
      label.compareDocumentPosition(screen.getByText(hint)) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      screen.getByText(hint).compareDocumentPosition(trigger) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})
