import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { FieldRow } from './field-row'
import { TextField } from './text-field'
import { SelectField } from './select-field'

describe('FieldRow', () => {
  it('marks the row container for intrinsic width resolution', () => {
    const { container } = render(
      <FieldRow>
        <TextField id="first" label="First name" />
      </FieldRow>,
    )

    expect(container.firstChild).toHaveAttribute('data-field-row', '')
  })

  it('applies row width classes to intrinsic-width fields', () => {
    render(
      <FieldRow>
        <SelectField
          id="kind"
          label="Kind"
          width="xl"
          placeholder="Choose"
          options={[
            { label: 'Self', value: 'self' },
            { label: 'Distance', value: 'distance' },
          ]}
        />
      </FieldRow>,
    )

    const fieldRoot = screen.getByLabelText('Kind').closest('.max-w-64')
    expect(fieldRoot).toHaveClass('in-data-[field-row]:w-64')
  })

  it('renders its child fields side by side with control-edge alignment', () => {
    const { container } = render(
      <FieldRow>
        <TextField id="first" label="First name" />
        <TextField id="last" label="Last name" />
      </FieldRow>,
    )
    expect(screen.getByLabelText('First name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last name')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('flex')
    expect(container.firstChild).toHaveClass('items-end')
    expect(container.firstChild).not.toHaveClass('grid')
  })

  it('supports start alignment for rows with reserved derived metadata', () => {
    const { container } = render(
      <FieldRow align="start">
        <TextField id="first" label="First name" />
        <TextField id="last" label="Last name" />
      </FieldRow>,
    )

    expect(container.firstChild).toHaveClass('items-start')
    expect(container.firstChild).not.toHaveClass('items-end')
  })

  it('wraps each field’s label + control band in a data-field-align anchor', () => {
    const { container } = render(
      <FieldRow>
        <TextField id="first" label="First name" />
      </FieldRow>,
    )

    const anchor = container.querySelector('[data-field-align]')
    expect(anchor).not.toBeNull()
    expect(anchor).toContainElement(screen.getByText('First name'))
    expect(anchor).toContainElement(screen.getByLabelText('First name'))
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <FieldRow>
        <TextField id="first" label="First name" />
        <TextField id="last" label="Last name" />
      </FieldRow>,
    )
    await expectNoAxeViolations(container)
  })
})
