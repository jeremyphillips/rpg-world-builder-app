import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

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

  it('renders its child fields side by side', () => {
    const { container } = render(
      <FieldRow>
        <TextField id="first" label="First name" />
        <TextField id="last" label="Last name" />
      </FieldRow>,
    )
    expect(screen.getByLabelText('First name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last name')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('flex')
    expect(container.firstChild).not.toHaveClass('grid')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <FieldRow>
        <TextField id="first" label="First name" />
        <TextField id="last" label="Last name" />
      </FieldRow>,
    )
    await expectNoAxeViolations(container)
  })
})
