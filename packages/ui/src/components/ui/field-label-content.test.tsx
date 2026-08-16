import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { FieldLabelContent } from './field-label-content'
import { FormFieldLabel } from '../../form/presentation/form-field-label.client'
import { Field } from './field.client'
import { Input } from './input.client'

describe('FieldLabelContent', () => {
  it('renders a single visible required marker for visible labels', () => {
    render(<FieldLabelContent label="Name" required showRequiredMarker />)
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getAllByText('*')).toHaveLength(1)
  })

  it('omits the visible marker when showRequiredMarker is false', () => {
    render(<FieldLabelContent label="Score 1" required showRequiredMarker={false} />)
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })
})

describe('FormFieldLabel', () => {
  it('shows the marker for visible required labels', () => {
    render(
      <Field.Root id="name" required>
        <FormFieldLabel label="Name" required />
        <Field.Control>
          <Input />
        </Field.Control>
      </Field.Root>,
    )
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('hides the marker for sr-only required labels', () => {
    render(
      <Field.Root id="score" required>
        <FormFieldLabel label="Standard array score 1" labelVisibility="srOnly" required />
        <Field.Control>
          <Input />
        </Field.Control>
      </Field.Root>,
    )
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })
})
